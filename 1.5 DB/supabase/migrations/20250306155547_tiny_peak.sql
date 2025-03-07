/*
  # Initial Schema Setup

  1. Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - role (text)
      - created_at (timestamp)
    - hotels
      - id (uuid, primary key)
      - name (text)
      - owner_name (text)
      - phone (text)
      - address (text)
      - address_link (text)
      - created_at (timestamp)
    - orders
      - id (uuid, primary key)
      - hotel_id (uuid, foreign key)
      - status (text)
      - total (numeric)
      - note (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    - order_items
      - id (uuid, primary key)
      - order_id (uuid, foreign key)
      - name (text)
      - quantity (numeric)
      - price (numeric)
      - unit (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for each role
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  address_link text,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES hotels(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total numeric NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  name text NOT NULL,
  quantity numeric NOT NULL,
  price numeric NOT NULL,
  unit text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policies for hotels table
CREATE POLICY "Anyone can read hotels"
  ON hotels
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage hotels"
  ON hotels
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

-- Policies for orders table
CREATE POLICY "Hotels can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (hotel_id IN (
    SELECT id FROM hotels
    WHERE id = hotel_id
  ));

CREATE POLICY "Admin can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

CREATE POLICY "Delivery can read assigned orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (status IN ('ready', 'delivering'));

-- Policies for order_items table
CREATE POLICY "Anyone can read order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));