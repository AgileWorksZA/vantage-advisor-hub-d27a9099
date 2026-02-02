
# Fix Products Display Consistency

## Problem Identified
The Summary tab shows products using **hardcoded mock data**, while the Products tab correctly fetches from the **database** (which is currently empty). This creates a confusing experience where products appear on one tab but not the other.

## Solution Overview
Make both tabs use the same data source (the database) by updating the Summary tab to use the `useClientProducts` hook, and ensure the database has proper foreign key relationships for data integrity.

---

## Implementation Steps

### Step 1: Add Missing Foreign Key Relationships
Create database migration to add proper foreign keys between tables:

- `client_products.product_id` → `products.id`
- `client_products.client_id` → `clients.id`
- `client_products.adviser_id` → `profiles.id`
- `products.provider_id` → `product_providers.id`
- `products.category_id` → `product_categories.id`

### Step 2: Update Summary Tab to Use Real Data
Modify `ClientSummaryTab.tsx` to:
- Accept `clientId` as a prop (instead of just `client`)
- Use the `useClientProducts` hook to fetch real products
- Replace the hardcoded `productsData` array with live database data
- Show a loading state and empty state when appropriate
- Calculate the total value from real data

### Step 3: Update ClientDetail Page
Modify how `ClientSummaryTab` is called to pass the `clientId` prop.

---

## Technical Details

### Database Migration SQL
```sql
-- Add foreign key from client_products to clients
ALTER TABLE client_products
ADD CONSTRAINT client_products_client_id_fkey
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Add foreign key from client_products to products
ALTER TABLE client_products
ADD CONSTRAINT client_products_product_id_fkey
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- Add foreign key from products to product_providers
ALTER TABLE products
ADD CONSTRAINT products_provider_id_fkey
FOREIGN KEY (provider_id) REFERENCES product_providers(id) ON DELETE SET NULL;

-- Add foreign key from products to product_categories
ALTER TABLE products
ADD CONSTRAINT products_category_id_fkey
FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL;
```

### Summary Tab Changes
- Import and use `useClientProducts` hook
- Replace static `productsData` with dynamic products from hook
- Group products by category for display
- Handle loading and empty states gracefully
- Format currency values consistently with Products tab

---

## Expected Outcome
After implementation:
- Both Summary and Products tabs will display the **same products** from the database
- When products are added via the Products tab, they will appear on the Summary tab
- Empty state will show on both tabs when no products exist
- The data model will have proper referential integrity via foreign keys
