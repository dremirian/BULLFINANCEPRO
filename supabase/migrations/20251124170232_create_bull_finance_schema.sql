/*
  # Bull Finance - Complete Financial Management System Schema
  
  ## Overview
  This migration creates a comprehensive financial management system with all features from Conta Azul and enhancements.
  
  ## New Tables
  
  ### 1. Companies
  - `id` (uuid, primary key) - Unique company identifier
  - `name` (text) - Company name
  - `cnpj` (text, unique) - Brazilian tax ID
  - `email` (text) - Company email
  - `phone` (text) - Company phone
  - `address` (text) - Company address
  - `city` (text) - City
  - `state` (text) - State
  - `postal_code` (text) - Postal code
  - `logo_url` (text, nullable) - Company logo URL
  - `owner_id` (uuid) - Reference to auth.users
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. Customers
  - `id` (uuid, primary key) - Unique customer identifier
  - `company_id` (uuid) - Reference to companies
  - `name` (text) - Customer name
  - `cpf_cnpj` (text) - CPF or CNPJ
  - `email` (text, nullable) - Customer email
  - `phone` (text, nullable) - Customer phone
  - `address` (text, nullable) - Customer address
  - `city` (text, nullable) - City
  - `state` (text, nullable) - State
  - `postal_code` (text, nullable) - Postal code
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. Suppliers
  - `id` (uuid, primary key) - Unique supplier identifier
  - `company_id` (uuid) - Reference to companies
  - `name` (text) - Supplier name
  - `cnpj` (text) - CNPJ
  - `email` (text, nullable) - Supplier email
  - `phone` (text, nullable) - Supplier phone
  - `address` (text, nullable) - Supplier address
  - `city` (text, nullable) - City
  - `state` (text, nullable) - State
  - `postal_code` (text, nullable) - Postal code
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 4. Products
  - `id` (uuid, primary key) - Unique product identifier
  - `company_id` (uuid) - Reference to companies
  - `name` (text) - Product name
  - `description` (text, nullable) - Product description
  - `sku` (text, nullable) - Stock keeping unit
  - `price` (decimal) - Product price
  - `cost` (decimal) - Product cost
  - `quantity` (integer) - Current stock quantity
  - `unit` (text) - Unit of measurement
  - `category` (text, nullable) - Product category
  - `active` (boolean) - Whether product is active
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 5. Invoices
  - `id` (uuid, primary key) - Unique invoice identifier
  - `company_id` (uuid) - Reference to companies
  - `customer_id` (uuid) - Reference to customers
  - `invoice_number` (text) - Invoice number
  - `issue_date` (date) - Issue date
  - `due_date` (date) - Due date
  - `payment_date` (date, nullable) - Payment date
  - `status` (text) - Status: draft, sent, paid, overdue, cancelled
  - `subtotal` (decimal) - Subtotal amount
  - `discount` (decimal) - Discount amount
  - `tax` (decimal) - Tax amount
  - `total` (decimal) - Total amount
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 6. Invoice Items
  - `id` (uuid, primary key) - Unique invoice item identifier
  - `invoice_id` (uuid) - Reference to invoices
  - `product_id` (uuid, nullable) - Reference to products
  - `description` (text) - Item description
  - `quantity` (decimal) - Item quantity
  - `unit_price` (decimal) - Unit price
  - `total` (decimal) - Total item amount
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 7. Expenses
  - `id` (uuid, primary key) - Unique expense identifier
  - `company_id` (uuid) - Reference to companies
  - `supplier_id` (uuid, nullable) - Reference to suppliers
  - `description` (text) - Expense description
  - `category` (text) - Expense category
  - `amount` (decimal) - Expense amount
  - `expense_date` (date) - Expense date
  - `due_date` (date, nullable) - Due date
  - `payment_date` (date, nullable) - Payment date
  - `status` (text) - Status: pending, paid, overdue
  - `payment_method` (text, nullable) - Payment method
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 8. Bank Accounts
  - `id` (uuid, primary key) - Unique bank account identifier
  - `company_id` (uuid) - Reference to companies
  - `name` (text) - Account name
  - `bank_name` (text) - Bank name
  - `account_number` (text) - Account number
  - `balance` (decimal) - Current balance
  - `active` (boolean) - Whether account is active
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 9. Transactions
  - `id` (uuid, primary key) - Unique transaction identifier
  - `company_id` (uuid) - Reference to companies
  - `bank_account_id` (uuid) - Reference to bank_accounts
  - `type` (text) - Type: income, expense
  - `category` (text) - Transaction category
  - `description` (text) - Transaction description
  - `amount` (decimal) - Transaction amount
  - `transaction_date` (date) - Transaction date
  - `reference_id` (uuid, nullable) - Reference to invoice or expense
  - `reference_type` (text, nullable) - Type of reference: invoice, expense
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  
  ## Security
  All tables have Row Level Security (RLS) enabled with policies that:
  - Allow authenticated users to read their own company data
  - Allow authenticated users to create, update, and delete their own company data
  - Restrict access based on company ownership
  
  ## Important Notes
  1. All monetary values use decimal type for precision
  2. All tables include timestamps for audit trail
  3. Foreign keys maintain referential integrity
  4. Indexes added for performance on frequently queried columns
*/

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cnpj text UNIQUE NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  logo_url text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own companies"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own companies"
  ON companies FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  cpf_cnpj text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view customers from their companies"
  ON customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = customers.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create customers for their companies"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = customers.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update customers from their companies"
  ON customers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = customers.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = customers.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete customers from their companies"
  ON customers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = customers.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  cnpj text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view suppliers from their companies"
  ON suppliers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = suppliers.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create suppliers for their companies"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = suppliers.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update suppliers from their companies"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = suppliers.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = suppliers.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete suppliers from their companies"
  ON suppliers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = suppliers.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  sku text,
  price decimal(12,2) NOT NULL DEFAULT 0,
  cost decimal(12,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'un',
  category text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view products from their companies"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = products.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create products for their companies"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = products.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update products from their companies"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = products.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = products.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete products from their companies"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = products.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  payment_date date,
  status text NOT NULL DEFAULT 'draft',
  subtotal decimal(12,2) NOT NULL DEFAULT 0,
  discount decimal(12,2) NOT NULL DEFAULT 0,
  tax decimal(12,2) NOT NULL DEFAULT 0,
  total decimal(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled'))
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invoices from their companies"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = invoices.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoices for their companies"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = invoices.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoices from their companies"
  ON invoices FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = invoices.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = invoices.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invoices from their companies"
  ON invoices FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = invoices.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Invoice Items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity decimal(12,2) NOT NULL,
  unit_price decimal(12,2) NOT NULL,
  total decimal(12,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invoice items from their companies"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN companies ON companies.id = invoices.company_id
      WHERE invoices.id = invoice_items.invoice_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoice items for their companies"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN companies ON companies.id = invoices.company_id
      WHERE invoices.id = invoice_items.invoice_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoice items from their companies"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN companies ON companies.id = invoices.company_id
      WHERE invoices.id = invoice_items.invoice_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN companies ON companies.id = invoices.company_id
      WHERE invoices.id = invoice_items.invoice_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invoice items from their companies"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN companies ON companies.id = invoices.company_id
      WHERE invoices.id = invoice_items.invoice_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  description text NOT NULL,
  category text NOT NULL,
  amount decimal(12,2) NOT NULL,
  expense_date date NOT NULL,
  due_date date,
  payment_date date,
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_expense_status CHECK (status IN ('pending', 'paid', 'overdue'))
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses from their companies"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = expenses.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create expenses for their companies"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = expenses.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses from their companies"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = expenses.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = expenses.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses from their companies"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = expenses.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Bank Accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  balance decimal(12,2) NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bank accounts from their companies"
  ON bank_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = bank_accounts.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bank accounts for their companies"
  ON bank_accounts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = bank_accounts.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update bank accounts from their companies"
  ON bank_accounts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = bank_accounts.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = bank_accounts.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete bank accounts from their companies"
  ON bank_accounts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = bank_accounts.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  bank_account_id uuid REFERENCES bank_accounts(id) ON DELETE SET NULL,
  type text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  amount decimal(12,2) NOT NULL,
  transaction_date date NOT NULL,
  reference_id uuid,
  reference_type text,
  notes text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_transaction_type CHECK (type IN ('income', 'expense')),
  CONSTRAINT valid_reference_type CHECK (reference_type IS NULL OR reference_type IN ('invoice', 'expense'))
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transactions from their companies"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = transactions.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transactions for their companies"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = transactions.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update transactions from their companies"
  ON transactions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = transactions.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = transactions.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete transactions from their companies"
  ON transactions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = transactions.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_expenses_company_id ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_supplier_id ON expenses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_company_id ON bank_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_bank_account_id ON transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);