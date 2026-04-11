import { supabase } from '@/lib/supabase/client';
import { Product, ProductVariant, ProductPackaging, ContractPrice } from '@/types';

export const productService = {
  async getAll(options?: { 
    categoryId?: string, 
    sortBy?: 'newest' | 'price_asc' | 'price_desc',
    hideBelowShortage?: boolean,
    search?: string
  }): Promise<Product[] | null> {
    
    // Fetch products with variants and packaging nested
    let query = supabase
      .from('products')
      .select(`
        *,
        variants:product_variants (
          *,
          packaging:product_packaging (*)
        )
      `);

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return null;
    }

    // Post-processing to ensure backward compatibility with older UI components
    // We map the default variant properties to the top level for simple displays
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
    const { data, error } = await supabase
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

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

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

   async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    // Current simple implementation: updates parent only. 
    // Variable product editing will be handled by a specialized management UI.
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }
    return this.getById(id);
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
  }
};
