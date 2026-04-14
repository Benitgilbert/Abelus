-- Add is_featured column to products table
ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
