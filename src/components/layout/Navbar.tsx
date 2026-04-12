"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingBag, 
  Menu, 
  X, 
  User,
  Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useCart } from '@/components/providers/CartProvider';
import { productService } from '@/lib/services/product-service';
import { Product } from '@/types';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchfocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { itemCount } = useCart();

  // Search bar only appears on Home (/) and Shop (/shop)
  const showSearch = pathname === '/' || pathname === '/shop';

  // Live Auto-complete Logic
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await productService.getAll({ search: searchQuery });
      setSuggestions(results?.slice(0, 5) || []);
      setIsSearching(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    setSuggestions([]);
    setIsSearchFocused(false);
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <span className="font-outfit text-xl font-black italic">P</span>
          </div>
          <span className="font-outfit text-xl font-bold tracking-tight text-[#1A1C1E]">PASTOR BONUS CO. LTD</span>
        </Link>

        {/* Desktop Search */}
        {showSearch && (
          <div className={cn(
            "hidden md:flex relative items-center flex-1 max-w-md mx-8 transition-all duration-300",
            isSearchfocused ? "max-w-lg" : "max-w-md"
          )}>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <Search className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                isSearching ? "text-primary animate-pulse" : "text-muted-foreground"
              )} />
              <input 
                type="text" 
                placeholder="Search products, calculators, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full rounded-2xl border bg-muted/30 py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </form>

            {/* Suggestions Dropdown */}
            {isSearchfocused && (searchQuery.length >= 2 || suggestions.length > 0) && (
              <div 
                className="absolute top-full left-0 mt-2 w-full rounded-2xl border bg-white/90 backdrop-blur-xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking suggestions
              >
                 {suggestions.length > 0 ? (
                   <>
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          router.push(`/shop?q=${encodeURIComponent(p.name)}`);
                          setSearchQuery(p.name);
                          setSuggestions([]);
                          setIsSearchFocused(false);
                        }}
                        className="flex w-full items-center gap-4 px-4 py-3 text-sm font-bold rounded-xl hover:bg-muted transition-colors text-left"
                      >
                         <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <ShoppingBag className="h-4 w-4" />
                         </div>
                         <div className="flex-1 overflow-hidden">
                            <p className="truncate text-[#1A1C1E]">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{(p.retail_price ?? 0).toLocaleString()} RWF</p>
                         </div>
                      </button>
                    ))}
                    <button 
                      onClick={handleSearchSubmit}
                      className="w-full mt-1 p-2 text-center text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      See all results for "{searchQuery}"
                    </button>
                   </>
                 ) : !isSearching ? (
                   <div className="p-8 text-center">
                      <p className="text-sm font-bold text-muted-foreground">No matches found.</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase">Try a different keyword</p>
                   </div>
                 ) : (
                   <div className="p-8 text-center">
                      <div className="h-2 w-24 bg-muted animate-pulse mx-auto rounded-full" />
                   </div>
                 )}
              </div>
            )}
            
            {/* Click-away overlay for search */}
            {isSearchfocused && (
              <div 
                className="fixed inset-0 -z-10" 
                onClick={() => setIsSearchFocused(false)} 
              />
            )}
          </div>
        )}

        {/* Desktop Menu */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/shop" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Shop</Link>
          <Link href="/print-portal" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            <Printer className="h-4 w-4" />
            Print Portal
          </Link>
          <Link href="/track" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            <Search className="h-4 w-4" />
            Track Order
          </Link>
          
          <div className="h-6 w-px bg-border mx-2" />

          <div className="flex items-center gap-6">
            <Link href="/cart" className="relative text-muted-foreground hover:text-primary transition-colors">
              <ShoppingBag className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-lg shadow-primary/20 animate-in fade-in zoom-in-50 duration-300">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link href="/login" className="rounded-xl border bg-white px-5 py-2.5 text-sm font-bold hover:bg-muted transition-all flex items-center gap-2">
              <User className="h-4 w-4" />
              Sign In
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-xl p-2 md:hidden hover:bg-muted transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t bg-white p-6 md:hidden animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4">
            <Link href="/shop" className="text-lg font-bold">Storefront</Link>
            <Link href="/print-portal" className="text-lg font-bold text-primary">Print Portal</Link>
            <Link href="/track" className="text-lg font-bold">Track Order</Link>
            <Link href="/cart" className="text-lg font-bold">Shopping Cart</Link>
            <div className="h-px bg-border my-2" />
            <Link href="/login" className="w-full rounded-2xl bg-primary py-4 text-center font-bold text-white">Sign In</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
