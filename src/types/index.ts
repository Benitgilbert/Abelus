export type UserRole = 'admin' | 'staff' | 'client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon_name?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  image_url?: string;
  has_variants: boolean;
  is_service: boolean;
  created_at: string;
  // Compatibility fields (mapped from default variant)
  stock_quantity?: number;
  buying_price?: number;
  selling_price?: number;
  retail_price?: number;
  sku?: string;
  // Joins
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  attributes: Record<string, any>; // e.g. { pages: 96 }
  buying_price: number;
  selling_price: number;
  retail_price: number;
  stock_quantity: number;
  is_default: boolean;
  image_url?: string;
  created_at: string;
  // Joins
  packaging?: ProductPackaging[];
}

export interface ProductPackaging {
  id: string;
  variant_id: string;
  unit_name: string;
  conversion_factor: number;
  selling_price: number;
  created_at: string;
}

export interface MarketClient {
  id: string;
  org_name: string;
  contact_person?: string;
  phone?: string;
  location?: string;
  debt_balance: number;
  credit_limit: number;
  created_at: string;
}

export interface ContractPrice {
  id: string;
  client_id: string;
  product_id: string;
  negotiated_price: number;
}

export interface Transaction {
  id: string;
  user_id?: string;
  client_id?: string;
  total_amount: number;
  payment_status: 'paid' | 'pending' | 'partial';
  payment_method: 'cash' | 'momo' | 'credit';
  amount_paid: number;
  evidence_url?: string;
  source: 'pos' | 'online';
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  variant_id?: string;
  unit_name?: string;
  quantity: number;
  price_at_sale: number;
  wishes: Record<string, any>;
  created_at: string;
}
