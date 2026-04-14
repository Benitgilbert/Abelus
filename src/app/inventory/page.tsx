"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AppShell } from '@/components/shared/AppShell';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download,
  AlertTriangle,
  MoreVertical,
  Edit3,
  Trash2,
  Loader2,
  Image as ImageIcon,
  ChevronRight,
  Layers,
  Settings2,
  X,
  Settings,
  ChevronDown,
  Hash,
  Tag,
  Zap,
  LayoutGrid,
  RefreshCw,
  MoreHorizontal,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product, ProductVariant, Category, ProductPackaging } from '@/types';
import { productService } from '@/lib/services/product-service';
import { useAuth } from '@/components/providers/AuthProvider';
import { categoryService } from '@/lib/services/category-service';

type ModalTab = 'general' | 'variants' | 'units';

const UNIVERSAL_ATTRIBUTES = ['Color', 'Size', 'Pages', 'Material', 'Weight', 'Voluming'];

interface VariantForm extends Partial<ProductVariant> {
  tempId: string;
}

export default function InventoryPage() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>('general');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // New Product State
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category_id: '',
    is_service: false,
    image_url: '',
    has_variants: false,
    selling_price: 0,
    buying_price: 0,
    stock_quantity: 0,
    sku: '',
    is_featured: false
  });

  // Variations State
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [customUnits, setCustomUnits] = useState<Partial<ProductPackaging>[]>([]);
  
  // Generator State
  const [generatorRows, setGeneratorRows] = useState<{key: string, values: string}[]>([{key: '', values: ''}]);

  const fetchData = useCallback(async () => {
    // Note: We don't set loading state here for realtime updates
    // to avoid layout shifts. Initial loading is handled in init()
    const [prodData, catData] = await Promise.all([
      productService.getAll(),
      categoryService.getAll()
    ]);
    if (prodData) setProducts(prodData);
    if (catData) setCategories(catData);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    init();

    // Enable Realtime Synchronization
    const channel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_packaging' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Professional SKU Generation Logic (sku-1001)
  const generateSmartSKU = (indexOffset = 0) => {
    const baseCount = products.length + 1001;
    const count = baseCount + indexOffset;
    // Add seconds and a random part to ensure absolute uniqueness across variants
    const entropy = `${new Date().getSeconds()}${Math.floor(Math.random() * 100)}`;
    return `SKU-${count}-${entropy}`;
  };

  const handleEditClick = (p: Product) => {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name,
      description: p.description || '',
      category_id: p.category_id || '',
      sku: p.sku || '',
      buying_price: p.buying_price || 0,
      selling_price: p.selling_price || 0,
      stock_quantity: p.stock_quantity || 0,
      image_url: p.image_url || '',
      is_service: p.is_service || false,
      has_variants: p.has_variants || false,
      is_featured: p.is_featured || false
    });
    if (p.variants) {
      setVariants(p.variants.map((v: any) => ({ ...v, tempId: Math.random().toString() })));
      const variantWithUnits = p.variants.find((v: any) => v.packaging && v.packaging.length > 0) || p.variants[0];
      if (variantWithUnits?.packaging) {
        setCustomUnits(variantWithUnits.packaging);
      }
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Permanently remove this asset from the vault?')) {
      productService.delete(id).then(() => fetchData());
    }
  };

  const handleCreateProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...productForm,
        sku: productForm.sku || generateSmartSKU(),
        variants: productForm.has_variants 
          ? variants.map(v => ({
              ...v,
              packaging: customUnits
            }))
          : [{
            selling_price: productForm.selling_price,
            buying_price: productForm.buying_price,
            stock_quantity: productForm.stock_quantity,
            sku: productForm.sku || generateSmartSKU(),
            packaging: customUnits,
            is_default: true
          }]
      };

      let res;
      if (editingProductId) {
        // Ensure we pass the full payload including variants and packaging
        res = await productService.update(editingProductId, payload);
      } else {
        res = await productService.create(payload);
      }

      if (res) {
        setIsModalOpen(false);
        resetForm();
        fetchData();
      }
    } catch (err: any) {
      console.error('Submission failed', err);
      alert(`System Error: ${err.message || err.details || 'An unexpected database error occurred.'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingProductId(null);
    setProductForm({
        name: '', description: '', category_id: categories.length > 0 ? categories[0].id : '',
        is_service: false,
        image_url: '', has_variants: false, selling_price: 0, buying_price: 0,
        stock_quantity: 0, sku: '', is_featured: false
    });
    setVariants([]);
    setCustomUnits([]);
    setGeneratorRows([{key: '', values: ''}]);
    setActiveTab('general');
  };

  const addVariant = () => {
    setVariants([...variants, { 
      tempId: Math.random().toString(), 
      sku: generateSmartSKU(variants.length), 
      attributes: {},
      stock_quantity: 0,
      selling_price: productForm.selling_price || 0,
      buying_price: productForm.buying_price || 0
    }]);
  };

  const generateMatrix = () => {
    // 1. Filter valid generator rows
    const activeGenerators = generatorRows.filter(r => r.key && r.values);
    if (activeGenerators.length === 0) return;

    // 2. Parse values into arrays
    const attributes = activeGenerators.map(r => ({
      key: r.key,
      vals: r.values.split(',').map(v => v.trim()).filter(Boolean)
    }));

    // 3. Cartesian Product (The "WooCommerce" engine)
    const cartesian = (sets: any[]) => {
      return sets.reduce((acc: any[], curr: any) => {
        return acc.flatMap((a: any) => curr.vals.map((b: any) => ({ ...a, [curr.key]: b })));
      }, [{}]);
    };

    const combinations = cartesian(attributes);

    // 4. Map to variant forms
    const newVariants = combinations.map((combo: any, idx: number) => ({
      tempId: Math.random().toString(),
      sku: generateSmartSKU(variants.length + idx),
      attributes: combo,
      stock_quantity: 0,
      selling_price: productForm.selling_price || 0,
      buying_price: productForm.buying_price || 0
    }));

    setVariants([...variants, ...newVariants]);
    // Clear generators to indicate success
    setGeneratorRows([{key: '', values: ''}]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { storageService } = await import('@/lib/services/storage-service');
      const url = await storageService.uploadAsset(file, 'products');
      if (url) {
        setProductForm(prev => ({ ...prev, image_url: url }));
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in -mt-8 px-4 md:px-8 pb-8 bg-slate-50/50 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between pt-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black font-outfit text-slate-900 tracking-tight">Inventory Vault</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <RefreshCw className="h-3 w-3" /> Live Warehouse Registry
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <LayoutGrid className="h-5 w-5 text-slate-300" />
             </div>
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-indigo-100 hover:bg-slate-900 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" /> Add New Asset
            </button>
          </div>
        </div>

        {/* Variations Wizard */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-none md:rounded-xl w-full h-full md:h-[650px] md:max-h-[90vh] md:max-w-5xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
              
              {/* Header */}
              <div className="px-6 md:px-8 py-4 md:py-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-100 shadow-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight leading-tight">{editingProductId ? 'Edit Asset' : 'Register Asset'}</h2>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{productForm.sku || "Sequential ID Pending"}</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 transition-all">
                  <X className="h-6 w-6"/>
                </button>
              </div>

              {/* Mobile Tab Navigation */}
              <div className="md:hidden flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto scrollbar-hide px-4">
                <button onClick={() => setActiveTab('general')} className={cn("px-4 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2", activeTab === 'general' ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-400")}>General</button>
                {productForm.has_variants && (
                  <button onClick={() => setActiveTab('variants')} className={cn("px-4 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2", activeTab === 'variants' ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-400")}>Variants</button>
                )}
                <button onClick={() => setActiveTab('units')} className={cn("px-4 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2", activeTab === 'units' ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-400")}>Packaging</button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Minimalist Sidebar (Desktop Only) */}
                <div className="hidden md:block w-60 border-r border-slate-100 bg-slate-50/30 p-4 space-y-1 overflow-y-auto shrink-0">
                  <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={Package} label="Core Details" />
                  {productForm.has_variants && (
                    <TabButton active={activeTab === 'variants'} onClick={() => setActiveTab('variants')} icon={Zap} label="Variations" />
                  )}
                  <TabButton active={activeTab === 'units'} onClick={() => setActiveTab('units')} icon={Layers} label="Packaging Units" />
                  
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 mb-3 uppercase tracking-widest px-4">Status & Logic</p>
                    <div className="px-4 py-3 bg-white border border-slate-100 rounded-lg space-y-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-600">Sync Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        <span className="text-[10px] font-bold text-slate-600">Sequential SKU Engine</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Form Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">

                  <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto px-6 md:px-10 py-6 md:py-10 space-y-8 md:space-y-10 scrollbar-hide">
                    {activeTab === 'general' && (
                      <div className="space-y-10 animate-in fade-in slide-in-from-right-2 duration-300">
                        {/* Information Grid */}
                        <div className="flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-10">
                          {/* Image Column */}
                          <div className="w-full md:col-span-4 space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Asset Visualization</label>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                            <div 
                              onClick={() => fileInputRef.current?.click()} 
                              className="aspect-video md:aspect-square rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-400 group hover:border-indigo-400 transition-all cursor-pointer overflow-hidden relative shadow-sm"
                            >
                               {productForm.image_url ? (
                                 <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                               ) : (
                                 <>
                                   <ImageIcon className="h-8 w-8 mb-2 opacity-20"/>
                                   <span className="text-[9px] font-bold uppercase tracking-widest">Upload Photo</span>
                                 </>
                               )}
                               {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-indigo-600 font-bold text-[10px]">UPLOADING...</div>}
                            </div>
                          </div>

                          {/* Data Column */}
                          <div className="md:col-span-8 space-y-6">
                            <Field label="Catalog Item Name" value={productForm.name} onChange={(v: string) => setProductForm({...productForm, name: v})} placeholder="e.g. BIC Cristal Blue Pen" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <Field label="Category" type="select" options={categories.map(c => ({label: c.name, value: c.id}))} value={productForm.category_id} onChange={(v: string) => setProductForm({...productForm, category_id: v})} />
                              <Field label="Manual SKU (Optional)" value={productForm.sku} onChange={(v: string) => setProductForm({...productForm, sku: v})} placeholder="Auto-generated if empty" />
                            </div>

                            <div className="space-y-3">
                              <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-white hover:border-amber-300 transition-all group">
                                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-50" checked={productForm.is_featured} onChange={() => setProductForm({...productForm, is_featured: !productForm.is_featured})} />
                                <div className="flex-1">
                                  <span className="block text-[11px] font-bold text-slate-800 uppercase tracking-tight">Mark as Featured [ACTIVE]</span>
                                  <span className="block text-[9px] text-slate-500 font-medium leading-tight">Hand-pick this item for the Landing Page spotlight.</span>
                                </div>
                                <Star className={cn("h-4 w-4 transition-colors shrink-0", productForm.is_featured ? "text-amber-500 fill-amber-500" : "text-slate-300")} />
                              </label>

                              <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-white hover:border-indigo-300 transition-all group">
                                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-50" checked={productForm.is_service} onChange={() => setProductForm({...productForm, is_service: !productForm.is_service})} />
                                <div className="flex-1">
                                  <span className="block text-[11px] font-bold text-slate-800 uppercase tracking-tight">Register as Service [ACTIVE]</span>
                                  <span className="block text-[9px] text-slate-500 font-medium leading-tight">Use for labor/services. Disables stock tracking.</span>
                                </div>
                                <Package className={cn("h-4 w-4 transition-colors shrink-0", productForm.is_service ? "text-emerald-600" : "text-slate-300")} />
                              </label>

                              <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-white hover:border-indigo-300 transition-all group">
                                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-50" checked={productForm.has_variants} onChange={() => setProductForm({...productForm, has_variants: !productForm.has_variants})} />
                                <div className="flex-1">
                                  <span className="block text-[11px] font-bold text-slate-800 uppercase tracking-tight">Enable Variations</span>
                                  <span className="block text-[9px] text-slate-500 font-medium leading-tight">Configure multiple colors, sizes, or weights.</span>
                                </div>
                                <Zap className={cn("h-4 w-4 transition-colors shrink-0", productForm.has_variants ? "text-indigo-600" : "text-slate-300")} />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Pricing & Stock Block */}
                        {!productForm.has_variants && (
                          <div className="pt-8 border-t border-slate-100">
                             <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6 px-1">Financial & Stock Inventory</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                                <Field label="Buying Cost" type="number" value={productForm.buying_price} onChange={(v: number) => setProductForm({...productForm, buying_price: v})} />
                                <Field label="Selling Price" type="number" value={productForm.selling_price} onChange={(v: number) => setProductForm({...productForm, selling_price: v})} />
                                <Field label="Starting Stock" type="number" value={productForm.stock_quantity} onChange={(v: number) => setProductForm({...productForm, stock_quantity: v})} />
                             </div>
                          </div>
                        )}

                        <div className="pt-4">
                          <Field label="Staff Operating Notes" type="textarea" value={productForm.description} onChange={(v: string) => setProductForm({...productForm, description: v})} placeholder="Material specs, weight, or origin details..." />
                        </div>
                      </div>
                    )}

                    {activeTab === 'variants' && (
                       <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                          <div className="bg-slate-900 rounded-xl p-6 md:p-8 text-white flex justify-between items-center overflow-hidden relative shadow-lg">
                             <div className="relative z-10">
                                <h3 className="text-lg md:text-xl font-bold tracking-tight">Variation Studio</h3>
                                <p className="text-xs text-slate-400 mt-1 max-w-[200px] md:max-w-none">Configure multiple attributes and mass-generate SKUs instantly.</p>
                             </div>
                             <Zap className="h-16 w-16 text-white/5 absolute -right-4 -bottom-4 rotate-12" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {generatorRows.map((row, idx) => (
                                <div key={idx} className="bg-slate-50 p-5 md:p-6 rounded-xl border border-slate-200 space-y-4">
                                   <div className="flex justify-between items-center mb-1">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Attribute {idx + 1}</label>
                                      {generatorRows.length > 1 && (
                                        <button type="button" onClick={() => setGeneratorRows(generatorRows.filter((_, i) => i !== idx))} className="h-6 w-6 flex items-center justify-center bg-white border rounded-lg text-slate-400 hover:text-red-500 transition-colors"><X className="h-3 w-3"/></button>
                                      )}
                                   </div>
                                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                      <div className="sm:col-span-1"><Field label="Name (e.g. Color)" value={row.key} onChange={(v: string) => {
                                         const n = [...generatorRows]; n[idx].key = v; setGeneratorRows(n);
                                      }} /></div>
                                      <div className="sm:col-span-2"><Field label="Values (Comma Sep)" value={row.values} onChange={(v: string) => {
                                         const n = [...generatorRows]; n[idx].values = v; setGeneratorRows(n);
                                      }} /></div>
                                   </div>
                                </div>
                             ))}
                          </div>

                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pt-2">
                             <div className="flex flex-wrap gap-2">
                                {UNIVERSAL_ATTRIBUTES.map(attr => (
                                   <button 
                                     key={attr} type="button" 
                                     onClick={() => !generatorRows.some(r => r.key === attr) && setGeneratorRows([...generatorRows, { key: attr, values: '' }])}
                                     className="px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all bg-white"
                                   >
                                      + {attr}
                                   </button>
                                ))}
                             </div>
                             <div className="flex flex-col sm:flex-row gap-3">
                                <button type="button" onClick={() => setGeneratorRows([...generatorRows, {key: '', values: ''}])} className="flex-1 px-5 py-2.5 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-all">+ Add Logic Row</button>
                                <button type="button" onClick={generateMatrix} className="flex-1 px-6 py-2.5 rounded-xl bg-indigo-600 text-[11px] font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Mass Build Matrix</button>
                             </div>
                          </div>

                          <div className="pt-6 md:pt-10 space-y-4">
                             <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-800">Generated Variations ({variants.length})</h4>
                                <button type="button" onClick={addVariant} className="text-[10px] font-bold text-indigo-600 hover:underline">+ Add Manual Entry</button>
                             </div>
                             
                             <div className="space-y-4">
                                {variants.map((v, idx) => (
                                   <div key={v.tempId} className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center p-5 rounded-xl border border-slate-200 bg-white group hover:border-indigo-300 transition-all shadow-sm">
                                      <div className="flex-1">
                                         <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Configuration</p>
                                         <div className="flex flex-wrap gap-1.5">
                                            {Object.entries(v.attributes || {}).map(([key, val]) => (
                                               <span key={key} className="text-[9px] font-black px-2 py-1 rounded-md border border-slate-100 bg-slate-50 text-slate-600 uppercase tracking-tighter">
                                                  {key}: {val}
                                               </span>
                                            ))}
                                         </div>
                                      </div>
                                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:flex md:items-center md:gap-6">
                                        <div className="w-full md:w-40"><Field label="Variant SKU" value={v.sku} onChange={(val: string) => {
                                           const n = [...variants]; n[idx].sku = val; setVariants(n);
                                        }} /></div>
                                        <div className="w-full md:w-28"><Field label="Price" type="number" value={v.selling_price} onChange={(val: number) => {
                                           const n = [...variants]; n[idx].selling_price = val; setVariants(n);
                                        }} /></div>
                                        <div className="w-full md:w-28"><Field label="Stock" type="number" value={v.stock_quantity} onChange={(val: number) => {
                                           const n = [...variants]; n[idx].stock_quantity = val; setVariants(n);
                                        }} /></div>
                                        <div className="flex items-end justify-end pb-1">
                                          <button type="button" onClick={() => setVariants(variants.filter(varnt => varnt.tempId !== v.tempId))} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all font-bold">
                                            <Trash2 className="h-4 w-4"/>
                                          </button>
                                        </div>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'units' && (
                       <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 md:p-8 flex items-start gap-5">
                             <Layers className="h-6 w-6 text-emerald-600 shrink-0" />
                             <div>
                                <h4 className="text-sm font-bold text-emerald-900">Multi-Unit Level Configuration</h4>
                                <p className="text-xs text-emerald-700/70 mt-1 leading-relaxed">Map bulk packaging like Boxes or Packets. The system calculates physical inventory based on conversion factors.</p>
                             </div>
                          </div>

                          <div className="space-y-4">
                             {customUnits.map((unit, idx) => (
                               <div key={idx} className="flex flex-col sm:flex-row gap-4 sm:items-end p-5 rounded-xl border border-slate-200 bg-slate-50/30 relative group">
                                 <div className="flex-1">
                                    <Field label="Unit Type" value={unit.unit_name} onChange={(v: string) => {
                                      const next = [...customUnits]; next[idx].unit_name = v; setCustomUnits(next);
                                    }} placeholder="e.g. Packet" />
                                 </div>
                                 <div className="grid grid-cols-2 gap-4 flex-[2]">
                                    <div className="w-full"><Field label="Pcs per Unit" type="number" value={unit.conversion_factor} onChange={(v: number) => {
                                      const next = [...customUnits]; next[idx].conversion_factor = v; setCustomUnits(next);
                                    }} /></div>
                                    <div className="w-full"><Field label="Selling Price" type="number" value={unit.selling_price} onChange={(v: number) => {
                                      const next = [...customUnits]; next[idx].selling_price = v; setCustomUnits(next);
                                    }} /></div>
                                 </div>
                                 <button type="button" onClick={() => setCustomUnits(customUnits.filter((_, i) => i !== idx))} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-300 hover:text-red-500 transition-all shadow-sm">
                                    <Trash2 className="h-4 w-4"/>
                                 </button>
                               </div>
                             ))}
                             <button type="button" onClick={() => setCustomUnits([...customUnits, { unit_name: '', conversion_factor: 1, selling_price: 0 }])} className="w-full py-4 rounded-xl border border-dashed border-slate-200 text-xs font-bold text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/10 transition-all flex items-center justify-center gap-2">
                                <Plus className="h-4 w-4" /> Add Bundle Configuration
                             </button>
                          </div>
                       </div>
                    )}
                  </form>

                  <div className="px-6 md:px-8 py-4 md:py-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors order-2 sm:order-1">Cancel Draft</button>
                    <button 
                      type="submit"
                      disabled={loading}
                      onClick={handleCreateProduct}
                      className="px-8 py-3.5 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-3 w-3" /> Save Asset To Vault</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Visualization */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
           <OverviewCard title="Asset Catalog" value={loading ? "..." : products.length} label="Total Unique SKUs Managed" color="blue" />
           <OverviewCard title="Stock Integrity" value={loading ? "..." : products.reduce((acc, p) => acc + (p.is_service ? 0 : (p.stock_quantity || 0)), 0)} label="Total Physical Pieces" color="indigo" />
           <OverviewCard title="Low Stock Alerts" value={loading ? "..." : products.filter(p => !p.is_service && (p.stock_quantity || 0) <= 20).length} label="Items below refill threshold" color="amber" />
        </div>

        {/* Registry Master Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="px-6 md:px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row gap-6 justify-between items-center bg-white">
              <div className="relative w-full max-w-2xl text-slate-700">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Universal Catalog Search (SKUs, Names, Variants)..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-3.5 pl-11 pr-4 text-xs font-semibold placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                 <button onClick={fetchData} className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">Sync Registry</button>
                 <button className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-indigo-600 transition-all shadow-md shrink-0"><Filter className="h-4 w-4"/></button>
              </div>
           </div>

           <div className="min-h-[400px]">
              {loading ? (
                <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Accessing Vault Registry...</p>
                </div>
              ) : (
                <>
                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto text-slate-700">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b bg-slate-50/50 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                          <th className="px-8 py-5">Product Identity</th>
                          <th className="px-8 py-5 text-center">Available Stock</th>
                          <th className="px-8 py-5">Financial Specs</th>
                          <th className="px-8 py-5">Unique SKU</th>
                          <th className="px-8 py-5 text-right">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredProducts.map(p => (
                          <tr key={p.id} className="group hover:bg-slate-50/30 transition-all">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-6">
                                  <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden shrink-0 text-slate-700">
                                     {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover"/> : <Package className="h-5 w-5 text-slate-300" />}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                       {p.name}
                                       {p.has_variants && <Tag className="h-3 w-3 text-indigo-400" />}
                                    </div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{categories.find(c => c.id === p.category_id)?.name || 'Uncategorized'}</p>
                                    
                                    {p.variants && p.variants.length > 0 && (
                                       <div className="flex flex-wrap gap-1 mt-1.5">
                                          {p.variants?.slice(0, 3).map((v: any, i) => (
                                             <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-100 bg-white text-slate-500 uppercase tracking-tighter">
                                                {Object.entries(v.attributes || {}).map(([k, vVal]) => `${vVal}`).join(', ')}
                                             </span>
                                          ))}
                                          {p.variants && p.variants.length > 3 && <span className="text-[8px] font-bold text-slate-300 flex items-center">+ {p.variants.length - 3}</span>}
                                       </div>
                                    )}
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                               <div className="flex flex-col items-center gap-1">
                                  <div className={cn(
                                    "text-sm font-bold px-3 py-1 rounded-md inline-flex items-center gap-1.5",
                                    p.is_service 
                                      ? "bg-slate-100 text-slate-500" 
                                      : (p.stock_quantity || 0) <= 20 
                                        ? "bg-red-50 text-red-600" 
                                        : "bg-emerald-50 text-emerald-600"
                                  )}>
                                     {p.is_service ? 'SERVICE' : (p.stock_quantity || 0).toLocaleString()}
                                     {!p.is_service && <span className="text-[9px] font-medium opacity-60">pcs</span>}
                                  </div>
                                  <div className="flex flex-wrap gap-1 justify-center max-w-[150px]">
                                    {p.variants?.[0]?.packaging?.map(unit => (
                                      <span key={unit.id} className="text-[8px] font-medium text-slate-400">
                                        {Math.floor((p.stock_quantity || 0) / unit.conversion_factor)} {unit.unit_name}
                                      </span>
                                    ))}
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-800">{Number(p.selling_price).toLocaleString()} <span className="text-[9px] font-medium text-slate-400 uppercase ml-0.5">RWF</span></span>
                                  <span className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-tight mt-0.5">Margin: {(Number(p.selling_price) - Number(p.buying_price)).toLocaleString()}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className="px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{p.sku || 'PENDING'}</span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex justify-end gap-2">
                                  <button 
                                    onClick={() => handleEditClick(p)}
                                    className="h-9 w-9 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all flex items-center justify-center shadow-sm"
                                  >
                                    <Edit3 className="h-4 w-4"/>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteClick(p.id)}
                                    className="h-9 w-9 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all flex items-center justify-center shadow-sm"
                                  >
                                    <Trash2 className="h-4 w-4"/>
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden divide-y divide-slate-50 text-slate-700">
                    {filteredProducts.map(p => (
                      <ProductCard 
                        key={p.id} 
                        p={p} 
                        categories={categories} 
                        onEdit={handleEditClick} 
                        onDelete={handleDeleteClick} 
                      />
                    ))}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-4 bg-slate-50/10">
                       <div className="h-16 w-16 bg-white border border-slate-100 rounded-full flex items-center justify-center">
                         <Package className="h-8 w-8 text-slate-200" />
                       </div>
                       <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">No matching assets found in vault</p>
                    </div>
                  )}
                </>
              )}
           </div>
        </div>
      </div>
    </AppShell>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[11px] font-bold uppercase transition-all relative",
        active 
          ? "bg-indigo-50/80 text-indigo-700 shadow-sm" 
          : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-800"
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-indigo-600" : "text-slate-400")} />
      {label}
      {active && <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-full" />}
    </button>
  );
}

function OverviewCard({ title, value, label, color }: any) {
  const borderColors: Record<string, string> = {
    blue: "border-blue-200",
    indigo: "border-indigo-200",
    amber: "border-amber-200",
  };
  return (
    <div className={cn("bg-white p-4 rounded-xl border-t-4 shadow-sm", borderColors[color])}>
       <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">{title}</h4>
       <div className="flex items-baseline gap-2">
         <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label.split(' ')[0]}</p>
       </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', options }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1">{label}</label>
       {type === 'select' ? (
         <select 
          value={value} 
          onChange={e => onChange(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
         >
           {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
         </select>
       ) : type === 'textarea' ? (
         <textarea 
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all resize-none"
         />
       ) : (
         <input 
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
         />
       )}
    </div>
  );
}

function ProductCard({ p, categories, onEdit, onDelete }: any) {
  const categoryName = categories.find((c: any) => c.id === p.category_id)?.name || 'Uncategorized';
  const margin = Number(p.selling_price) - Number(p.buying_price);
  
  return (
    <div className="p-6 space-y-5 bg-white border-b border-slate-100 relative group animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
           {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover"/> : <Package className="h-6 w-6 text-slate-300" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em]">{categoryName}</p>
             <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 font-mono text-[9px] font-black text-slate-400">{p.sku || 'N/A'}</span>
          </div>
          <h4 className="text-sm font-black text-slate-900 leading-tight flex items-center gap-2">
            {p.name}
            {p.has_variants && <Tag className="h-3 w-3 text-indigo-400" />}
          </h4>
          <div className="flex flex-wrap gap-1 mt-2">
            {p.variants?.slice(0, 3).map((v: any, i: number) => (
               <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-tighter">
                  {Object.entries(v.attributes || {}).map(([, vVal]) => `${vVal}`).join(', ')}
               </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100/50">
        <div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Quantity</p>
          <div className={cn(
            "text-xs font-black px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 border",
            p.is_service ? "bg-slate-50 text-slate-400 border-slate-100" : (p.stock_quantity || 0) <= 20 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
          )}>
            <div className={cn("h-1.5 w-1.5 rounded-full", p.is_service ? "bg-slate-300" : (p.stock_quantity || 0) <= 20 ? "bg-rose-500" : "bg-emerald-500")} />
            {p.is_service ? 'SERVICE' : (p.stock_quantity || 0).toLocaleString()}
            {!p.is_service && <span className="text-[9px] font-bold opacity-60">PCS</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Price / Margin</p>
          <p className="text-sm font-black text-slate-900 leading-none">{Number(p.selling_price).toLocaleString()} <span className="text-[9px] opacity-40 uppercase">rwf</span></p>
          <p className="text-[9px] font-semibold text-emerald-600/70 uppercase tracking-tighter mt-1.5">Net: {margin.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-wrap gap-2">
          {p.variants?.[0]?.packaging?.slice(0, 2).map((unit: any) => (
            <span key={unit.id} className="text-[9px] font-bold text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
              <Layers className="h-3 w-3 opacity-30" /> {Math.floor((p.stock_quantity || 0) / unit.conversion_factor)} {unit.unit_name}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
           <button onClick={() => onEdit(p)} className="h-10 w-10 bg-slate-900 rounded-xl text-white shadow-lg active:scale-90 transition-all flex items-center justify-center">
             <Edit3 className="h-4.5 w-4.5"/>
           </button>
           <button onClick={() => onDelete(p.id)} className="h-10 w-10 bg-white rounded-xl text-slate-300 border border-slate-100 active:scale-90 transition-all flex items-center justify-center">
             <Trash2 className="h-4.5 w-4.5"/>
           </button>
        </div>
      </div>
    </div>
  );
}
