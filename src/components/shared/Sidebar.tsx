"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Printer, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { Home } from 'lucide-react';

const navigation = [
  { name: 'Public Shop', href: '/', icon: Home },
  { name: 'Dashboard', href: '/management', icon: BarChart3 },
  { name: 'Retail POS', href: '/pos', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Market Clients', href: '/market', icon: Users },
  { name: 'Print Center', href: '/admin/print-orders', icon: Printer },
  { name: 'Financials', href: '/financials', icon: CreditCard },
  { name: 'Admin Control', href: '/admin/settings', icon: ShieldCheck },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(item => {
    if (profile?.role === 'staff') {
      return !['Financials', 'Admin Control'].includes(item.name);
    }
    return true;
  });

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-xl transition-all">
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <span className="text-xl font-bold text-white">PB</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground font-outfit">PASTOR BONUS CO. LTD</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "group-hover:text-foreground")} />
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 h-6 w-1 rounded-r-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <ChevronRight className={cn("ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100", isActive && "hidden")} />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t p-4 space-y-4">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold uppercase truncate">
             {profile?.full_name?.slice(0, 2) || 'AD'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-muted-foreground truncate italic capitalize">{profile?.role || 'System Admin'}</p>
          </div>
        </div>
        
        <button 
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
