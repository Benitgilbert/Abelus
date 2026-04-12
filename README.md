
# 🌌 ABELUS | The Unified Business Operating System

<div align="center">

```text
      ___           ___           ___           ___           ___           ___     
     /\  \         /\  \         /\  \         /\__\         /\  \         /\  \    
    /::\  \       /::\  \       /::\  \       /:/  /        /::\  \       /::\  \   
   /:/\:\  \     /:/\:\  \     /:/\:\  \     /:/  /        /:/\:\  \     /:/\:\  \  
  /::\~\:\  \   /::\~\:\  \   /::\~\:\  \   /:/  /        /::\~\:\  \   /:/  /::\  \ 
 /:/\:\ \:\__\ /:/\:\ \:\__\ /:/\:\ \:\__\ /:/__/        /:/\:\ \:\__\ /:/__/ \:\__\
 \/__\:\/:/  / \/__\:\/:/  / \/__\:\/:/  / \:\  \        \/__\:\/:/  / \:\  \  \/__/
      \::/  /       \::/  /       \::/  /   \:\  \            \::/  /   \:\  \      
      /:/  /        /:/  /        /:/  /     \:\  \           /:/  /     \:\  \     
     /:/  /        /:/  /        /:/  /       \:\__\         /:/  /       \:\__\    
     \/__/         \/__/         \/__/         \/__/         \/__/         \/__/    
```

**[ General Retail • Stationery • Print Management • Financial Intelligence ]**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://framer.com/motion)

</div>

---

## 💎 The Vision
**Abelus** is a high-performance, professional-grade management ecosystem designed for modern Rwandan enterprises. Built with a "surgical" UI aesthetic and high-density information architecture, it unifies retail operations, stationery stock management, and custom print service auditing into a single source of truth.

---

## 🛠️ Core Modules

### 📦 1. Executive Inventory Control
Advanced management for general retail and stationery goods.
- **Granular Tracking**: Real-time stock alerts and replenishment monitoring.
- **Product Variants**: Support for complex product structures (sizes, units, packaging).
- **Shortage Analytics**: Intelligent detection of low-stock items across all categories.

### 🛒 2. Smart Retail POS
A sleek, high-speed Point of Sale optimized for any retail environment.
- **Multi-Payment Checkout**: Integrated workflows for Cash, MoMo, and Credit.
- **Contract Pricing**: Client-specific negotiated rates injected at point-of-sale.
- **Transaction Ledger**: Real-time sales visualization and staff performance tracking.

### 🖨️ 4. Print Audit Workstation
The specialized engine for managing walk-in and bulk printing services.
- **Service Audit Modal**: Pop-up workstation for B&W, Color, Binding, and Editing audits.
- **Universal Editable Rates**: Real-time yield calculation for customized service billing.
- **WhatsApp Automation**: Kinyarwanda-localized client status notifications via integrated API.

### 📈 5. Financial Intelligence
Comprehensive tools for tracking business health.
- **Universal Tracking**: Every transaction linked via `tracking_id` across POS and Online channels.
- **Revenue Breakdown**: Daily/Weekly P&L visualizations by service type and staff member.
- **Credit Management**: Clear auditing for contract-based client debts and credit limits.

---

## 📐 System Architecture

```mermaid
graph TD
    User((Staff/Admin)) -->|POS/Audit| App[Abelus Dashboard]
    Client((Customer)) -->|Track Order| Portal[Client Portal]
    
    subgraph "Core Backend"
        App -->|Submit Sale| DB[(Supabase Postgres)]
        Portal -->|Fetch Status| DB
        DB -->|Trigger| Notify[WhatsApp API]
    end

    subgraph "Analytical Layer"
        DB -->|Ledger Data| Analytics[Financial Reporting]
        DB -->|Stock Sync| Inventory[Inventory Management]
    end
    
    style "Core Backend" fill:#f0fff8,stroke:#10b981,stroke-width:2px
```

---

## 🚀 Technology Stack
- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Emerald/Slate Design System)
- **Backend / Auth**: [Supabase](https://supabase.com/)
- **Animations**: [Framer Motion](https://framer.com/motion)

---

<div align="center">
Built for <b>Abelus Enterprise</b>
</div>
