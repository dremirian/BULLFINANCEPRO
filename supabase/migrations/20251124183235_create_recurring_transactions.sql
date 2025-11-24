/*
  # Create Recurring Transactions Table
  
  This migration creates the infrastructure for recurring revenue and expense transactions.
  
  ## New Tables
  
  ### recurring_transactions
  - `id` (uuid, primary key) - Unique identifier
  - `company_id` (uuid) - Reference to companies
  - `type` (text) - Type: receivable or payable
  - `description` (text) - Transaction description
  - `amount` (decimal) - Transaction amount
  - `frequency` (text) - Frequency: monthly, quarterly, annual
  - `start_date` (date) - Start date for recurrence
  - `end_date` (date, nullable) - Optional end date
  - `customer_id` (uuid, nullable) - Reference to customers (for receivables)
  - `supplier_id` (uuid, nullable) - Reference to suppliers (for payables)
  - `category` (text, nullable) - Transaction category
  - `payment_method` (text, nullable) - Payment method
  - `active` (boolean) - Whether recurrence is active
  - `last_generated` (date, nullable) - Last date a transaction was generated
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ## Security
  - Enable RLS on recurring_transactions table
  - Add policies for authenticated users to manage their company's recurring transactions
*/

-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('receivable', 'payable')),
  description text NOT NULL,
  amount decimal(15,2) NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annual', 'weekly')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  category text,
  payment_method text,
  active boolean DEFAULT true,
  last_generated date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view recurring transactions from their company"
  ON recurring_transactions
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert recurring transactions for their company"
  ON recurring_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update recurring transactions from their company"
  ON recurring_transactions
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete recurring transactions from their company"
  ON recurring_transactions
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_company_id ON recurring_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_active ON recurring_transactions(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_generation ON recurring_transactions(last_generated, start_date) WHERE active = true;
