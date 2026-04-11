import React from 'react';
import { ShieldCheck, Zap, Clock, CreditCard } from 'lucide-react';

const props = [
  { icon: ShieldCheck, title: "Tested Warranty", desc: "Every item is verified 'Good Working' before it reaches you." },
  { icon: Zap, title: "MoMo Express", desc: "Pay instantly with MTN or Airtel Money via Paypack." },
  { icon: Clock, title: "Zero Wait-time", desc: "Upload online, skip the queue in-store." },
  { icon: CreditCard, title: "B2B Credit", desc: "Negotiated terms for our partner organizations." },
];

export function TrustBar() {
  return (
    <section className="bg-white py-12 border-y border-muted">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {props.map((p, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary shrink-0">
                <p.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-outfit text-sm font-black uppercase tracking-wider text-[#1A1C1E]">{p.title}</h4>
                <p className="mt-1 text-xs font-medium text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
