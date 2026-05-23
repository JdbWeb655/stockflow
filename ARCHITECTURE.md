# StockFlow Architecture

## Data Model & Relationships
- **Multi-tenancy**: Every table (`products`, `sales`) is linked to a `user_id` from the `profiles` table, ensuring strict data isolation.
- **Profiles**: Extension of Supabase Auth (`auth.users`) to manage metadata like subscription plans (`FREE`, `PREMIUM`).
- **Sales Snapshots**: The `sale_items` table stores `product_name` and `unit_price` at the moment of transaction. This ensures historical integrity even if the original product is modified or deleted later.

## Security (Row Level Security - RLS)
- **Isolation**: RLS is enabled globally across all tables.
- **Access Control**: Users are restricted to their own data via policies: `USING (auth.uid() = user_id)`.
- **Sale Items**: Access is granted through a subquery check on the parent `sales` table to verify ownership.

## Freemium Logic
- **Product Limit**: Users on the `FREE` plan are limited to **20 products**.
- **Dual-Layer Enforcement**:
  - **Frontend**: Managed via the `canAddProduct` utility in `models.ts`.
  - **Database**: A PostgreSQL Trigger (`tr_limit_products_freemium`) acts as a hard constraint, preventing inserts if the limit is exceeded.

## Performance & Scalability
- **Composite Indexes**:
  - `(user_id, sku)` for fast inventory lookups and uniqueness.
  - `(user_id, sale_date)` for optimized reporting and dashboard performance.
- **Foreign Keys**: Configured with `ON DELETE CASCADE` for profiles and `ON DELETE SET NULL` for products within sales to maintain history.

## Supabase Integration
- `productsStore.ts` uses the Supabase client (`supabase.ts`) for all CRUD operations on the `products` table.
- Queries include RLS policies automatically enforced by Supabase.
- The store fetches products per user via `auth.uid()` in queries.
- AuthCallback handles both redirect-based and hash-fragment tokens for Magic Link login.
- Added support for email/password authentication as an alternative to Magic Link.
