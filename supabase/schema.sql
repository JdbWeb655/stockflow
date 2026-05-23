-- Supabase schema for StockFlow
-- =========================================

-- -----------------
-- 1. Users Table
-- -----------------
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  username text NOT NULL UNIQUE,
  phone text,
  plan text NOT NULL DEFAULT 'FREE', -- FREE or PREMIUM
  created_at timestamp with time zone DEFAULT now()
);

-- ---------------------
-- 2. Products Table
-- ---------------------
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  stock integer NOT NULL,
  category text,
  size text,
  color text,
  photos text[] DEFAULT ARRAY[]::text[],
  sold boolean DEFAULT FALSE,
  created_at timestamp with time zone DEFAULT now()
);

-- -----------------
-- 3. Sales Table
-- -----------------
CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  total numeric(10,2) NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- ==============================
-- Indexes for frequent queries
-- ==============================
-- Users: search by email & username
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Products: by user_id, category, price, name
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_name ON products(name);

-- Sales: by user_id, product_id, created_at
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_product_id ON sales(product_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);

-- ==============================
-- Row Level Security Policies
-- ==============================
-- Enable RLS on each table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Users: only owner can access
CREATE POLICY users_self_access ON users AS PERMISSIVE FOR ALL
  USING (auth.uid() = id);

-- Products: owner can control each operation separately
CREATE POLICY products_select ON products AS PERMISSIVE FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY products_update ON products AS PERMISSIVE FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY products_delete ON products AS PERMISSIVE FOR DELETE
  USING (user_id = auth.uid());

-- Products: restrict inserts to owner
CREATE POLICY products_insert ON products AS PERMISSIVE FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Sales: owner of the user who made the purchase can access
CREATE POLICY sales_select ON sales AS PERMISSIVE FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY sales_update ON sales AS PERMISSIVE FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY sales_delete ON sales AS PERMISSIVE FOR DELETE
  USING (user_id = auth.uid());

-- Sales: restrict inserts to owner
CREATE POLICY sales_insert ON sales AS PERMISSIVE FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ==============================
-- Function & Trigger for product limit
-- ==============================
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS trigger AS $$
BEGIN
  IF NEW.user_id IS NOT NULL AND (SELECT plan FROM users WHERE id = NEW.user_id) = 'FREE' THEN
    IF (SELECT COUNT(*) FROM products WHERE user_id = NEW.user_id) >= 20 THEN
      RAISE EXCEPTION 'Usuario gratuito alcanzó límite de 20 productos';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_product_limit
BEFORE INSERT ON products
FOR EACH ROW EXECUTE PROCEDURE check_product_limit();

-- ==============================
-- Function & Trigger for stock decrement on sale
-- ==============================
CREATE OR REPLACE FUNCTION decrement_stock_on_sale()
RETURNS trigger AS $$
DECLARE
  current_stock integer;
BEGIN
  SELECT stock INTO current_stock FROM products WHERE id = NEW.product_id FOR UPDATE;

  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;

  IF current_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Stock insuficiente: hay % unidades, se intentan vender %', current_stock, NEW.quantity;
  END IF;

  UPDATE products SET stock = stock - NEW.quantity WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_decrement_stock_on_sale
BEFORE INSERT ON sales
FOR EACH ROW EXECUTE FUNCTION decrement_stock_on_sale();

-- ==============================
-- End of schema.sql
-- =========================================