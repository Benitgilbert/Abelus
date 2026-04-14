import { supabase } from '@/lib/supabase/client';
import { Product, ProductVariant, ProductPackaging, ContractPrice } from '@/types';
import { safeQuery, retryOperation } from '@/lib/utils/network-utils';

export const productService = {
  async getAll(options?: { 
    categoryId?: string, 
    sortBy?: 'newest' | 'price_asc' | 'price_desc',
    hideBelowShortage?: boolean,
    search?: string,
    isFeatured?: boolean
  }): Promise<Product[] | null> {
    
    // Fetch products with variants and packaging nested using safeQuery for resilience
    const data = await safeQuery<any[]>(async () => {
      const query = supabase
        .from('products')
        .select(`
          *,
          variants:product_variants (
            *,
            packaging:product_packaging (*)
          )
        `);

      if (options?.categoryId) {
        query.eq('category_id', options.categoryId);
      }

      if (options?.search) {
        query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      if (options?.isFeatured !== undefined) {
        query.eq('is_featured', options.isFeatured);
      }

      return await query;
    }, []);

    if (!data || data.length === 0) return [];

    // Post-processing to ensure backward compatibility with older UI components
    const results = (data as any[]).map(product => {
      const defaultVariant = product.variants?.find((v: any) => v.is_default) || product.variants?.[0];
      return {
        ...product,
        // Compatibility fields
        stock_quantity: product.variants?.reduce((acc: number, v: any) => acc + (v.stock_quantity || 0), 0) || 0,
        selling_price: defaultVariant?.selling_price || 0,
        retail_price: defaultVariant?.retail_price || 0,
        buying_price: defaultVariant?.buying_price || 0,
        sku: defaultVariant?.sku || '',
      };
    }) as Product[];

    return results;
  },

  async getById(id: string): Promise<Product | null> {
    const data = await safeQuery<any>(async () => {
      return await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants (
            *,
            packaging:product_packaging (*)
          )
        `)
        .eq('id', id)
        .single();
    });

    if (!data) return null;

    const defaultVariant = data.variants?.find((v: any) => v.is_default) || data.variants?.[0];
    return {
      ...data,
      stock_quantity: data.variants?.reduce((acc: number, v: any) => acc + (v.stock_quantity || 0), 0) || 0,
      selling_price: defaultVariant?.selling_price || 0,
      retail_price: defaultVariant?.retail_price || 0,
      buying_price: defaultVariant?.buying_price || 0,
      sku: defaultVariant?.sku || '',
    } as Product;
  },

  /**
   * Creates a product. If it's a simple product, it also creates the default variant.
   */
  async create(productData: any): Promise<Product | null> {
    // Destructure everything that should NOT go into the parent 'products' table metadata
    const { 
      variants, 
      selling_price, 
      buying_price, 
      retail_price,
      stock_quantity, 
      sku, 
      shortage_limit,
      category_id,
      ...parentInfo 
    } = productData;

    // 1. Create the parent product
    const { data: parent, error: pError } = await supabase
      .from('products')
      .insert({
        ...parentInfo,
        category_id: category_id === '' ? null : category_id,
        is_featured: productData.is_featured || false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (pError) throw pError;

    // 2. Create variants
    if (variants && variants.length > 0) {
      // Handle multiple variants
      for (const v of variants) {
        const { packaging, tempId, ...vInfo } = v;
        const { data: variant, error: vError } = await supabase
          .from('product_variants')
          .insert({ ...vInfo, product_id: parent.id })
          .select().single();
        
        if (vError) throw vError;

        if (packaging && packaging.length > 0) {
           await supabase.from('product_packaging').insert(
             packaging.map((p: any) => ({ ...p, variant_id: variant.id }))
           );
        }
      }
    } else {
      // Create a default variant for simple products (Backward Compatibility)
      const { data: variant, error: vError } = await supabase
        .from('product_variants')
        .insert({
          product_id: parent.id,
          sku: sku || `SKU-${Date.now()}`,
          buying_price: buying_price || 0,
          selling_price: selling_price || 0,
          retail_price: retail_price || 0,
          stock_quantity: stock_quantity || 0,
          is_default: true
        })
        .select().single();
      
      if (vError) throw vError;
    }

    return this.getById(parent.id);
  },

  async update(id: string, updates: any): Promise<Product | null> {
    // 1. Destructure to separate parent product fields from variant/compatibility fields
    const { 
      variants, 
      selling_price, 
      buying_price, 
      retail_price, 
      stock_quantity, 
      sku, 
      packaging,
      is_featured,
      created_at,
      updated_at,
      ...parentUpdates 
    } = updates;

    // 2. Update the parent product record
    const { error: pError } = await supabase
      .from('products')
      .update({
        ...parentUpdates,
        is_featured
      })
      .eq('id', id);

    if (pError) {
      console.error('Error updating parent product:', pError);
      return null;
    }

    // 3. Sync Logic based on product complexity
    if (updates.has_variants && variants) {
      // Complex Sync: Loop through all variants and sync their specific data
      for (const v of variants) {
        const { packaging: vPkg, tempId, created_at: _cv, updated_at: _uv, product_id: _pid, ...vInfo } = v;
        
        let variantId = v.id;
        if (variantId) {
          // Update existing variant record
          await supabase.from('product_variants').update(vInfo).eq('id', variantId);
        } else {
          // Safety: If no ID but exists in array, it's a new variation added during edit
          const { data: newV } = await supabase
            .from('product_variants')
            .insert({ ...vInfo, product_id: id })
            .select()
            .single();
          variantId = newV?.id;
        }

        // Sync Packaging Units for THIS specific variant
        if (variantId && vPkg) {
          await supabase.from('product_packaging').delete().eq('variant_id', variantId);
          if (vPkg.length > 0) {
            await supabase.from('product_packaging').insert(
              vPkg.map((p: any) => ({
                variant_id: variantId,
                unit_name: p.unit_name,
                conversion_factor: p.conversion_factor,
                selling_price: p.selling_price
              }))
            );
          }
        }
      }
    } else {
      // Simple Sync: Update the default variant and its global packaging
      const { data: variant, error: vError } = await supabase
        .from('product_variants')
        .update({
          selling_price,
          buying_price,
          retail_price,
          stock_quantity,
          sku
        })
        .eq('product_id', id)
        .eq('is_default', true)
        .select().single();

      if (!vError && variant && packaging) {
        // Sync Packaging Units for the default variant
        await supabase.from('product_packaging').delete().eq('variant_id', variant.id);
        if (packaging.length > 0) {
          await supabase.from('product_packaging').insert(
            packaging.map((p: any) => ({
              variant_id: variant.id,
              unit_name: p.unit_name,
              conversion_factor: p.conversion_factor,
              selling_price: p.selling_price
            }))
          );
        }
      }
    }

    return productService.getById(id);
  },

  async getContractPrices(clientId: string): Promise<ContractPrice[] | null> {
    const { data, error } = await supabase
      .from('contract_prices')
      .select('*')
      .eq('client_id', clientId);

    if (error) return null;
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    return !error;
  },

  async getShortages(threshold: number = 5): Promise<any[] | null> {
    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        *,
        product:products!inner (
          name,
          is_service
        )
      `)
      .eq('product.is_service', false)
      .lt('stock_quantity', threshold)
      .order('stock_quantity', { ascending: true });

    if (error) {
      console.error('Error fetching shortages:', error);
      return null;
    }
    return data;
  }
};
