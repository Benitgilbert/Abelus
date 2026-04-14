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
  CreditCard,
  FileText,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { Home } from 'lucide-react';

const navigation = [
  { name: 'Public Shop', href: '/', icon: Home },
  { name: 'Dashboard', href: '/management', icon: BarChart3 },
  { name: 'Retail POS', href: '/pos', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Client Abonné', href: '/market', icon: Users },
  { name: 'Print Center', href: '/admin/print-orders', icon: Printer },
  { name: 'Marketing Reach', href: '/admin/subscribers', icon: Mail },
  { name: 'Financials', href: '/financials', icon: CreditCard },
  { name: 'Daily Report', href: '/reports', icon: FileText },
  { name: 'Admin Control', href: '/admin/settings', icon: ShieldCheck },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar on route change on mobile
  React.useEffect(() => {
    if (onClose) onClose();
  }, [pathname]);

  const filteredNavigation = navigation.filter(item => {
    // Admins see everything
    if (profile?.role === 'admin') return true;
    
    // Staff are strictly for operations (POS, Inventory, Market, Print)
    if (profile?.role === 'staff') {
      return !['Dashboard', 'Financials', 'Admin Control'].includes(item.name);
    }

    // Clients see only the public shop (add portal later if needed)
    if (profile?.role === 'client') {
      return item.name === 'Public Shop';
    }

    return true;
  });

  if (!mounted) {
    return (
      <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-xl animate-pulse">
        <div className="flex h-20 items-center px-6" />
        <div className="flex-1 space-y-4 px-6 py-8" />
      </div>
    );
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "flex h-full flex-col border-r bg-card/50 backdrop-blur-xl transition-all",
        "fixed inset-y-0 left-0 z-[101] w-64 md:static md:z-10 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
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

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted font-outfit",
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

        <div className="mt-auto border-t p-4 space-y-4 bg-muted/20">
          <div className="flex items-center gap-3 px-2 py-3 bg-white/50 rounded-2xl border border-white">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black uppercase text-primary border border-primary/20 shrink-0">
               {profile?.full_name?.slice(0, 2) || 'AD'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate font-outfit">{profile?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate font-black">{profile?.role || 'Staff'}</p>
            </div>
          </div>
          
          <button 
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
