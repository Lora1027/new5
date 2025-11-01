# Inkhale Business Platform (Next.js + Supabase)

Features:
- Email/password login with Supabase Auth
- Income & Expenses with filters (type, category, method of payment: cash / gcash / bank; date range)
- Cash on hand & Bank balances (manual entries) to reconcile with computed net profit
- Inventory management (add single item; bulk CSV upload)
- Comparison tab: KPI summary for two date ranges (Revenue, Expenses, Gross Margin est., Net Profit, MoP breakdowns)

## 1) Create Supabase project
1. Go to https://supabase.com > New project.
2. Copy the **Project URL** and **anon public key**.
3. Open **SQL editor** > paste the contents of `supabase/schema.sql` > Run.

## 2) Configure environment
Create `.env.local` in the project root:
```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
No server keys required for this MVP.

## 3) Run locally
```bash
npm i
npm run dev
```
Open http://localhost:3000

## 4) Deploy to Vercel
- Create a new project from your GitHub repo.
- Add environment variables in Vercel (same as `.env.local`).

## CSV template (Inventory bulk)
See `supabase/examples/inventory_template.csv`.
Columns: `sku,name,unit_cost,qty_on_hand`

## Notes
- RLS policies restrict rows to the signed-in user.
- "Gross Margin (est.)" uses inventory unit_cost * quantity_sold (derived from `transactions` with category = "COGS"). Adjust logic for your business.
- This is a clean MVP you can extend.
