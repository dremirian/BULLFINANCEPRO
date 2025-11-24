/*
  # Bull Finance - Complete Financial Management Platform
  
  ## Overview
  This migration expands the Bull Finance system with all required modules for a complete
  financial management SaaS platform with consultant multi-company support.
  
  ## New Tables
  
  ### 1. Accounts Receivable (Contas a Receber)
  - `id` (uuid, primary key) - Unique identifier
  - `company_id` (uuid) - Reference to companies
  - `customer_id` (uuid, nullable) - Reference to customers
  - `description` (text) - Account description
  - `category_id` (uuid, nullable) - Reference to chart of accounts
  - `cost_center_id` (uuid, nullable) - Reference to cost centers
  - `amount` (decimal) - Account amount
  - `due_date` (date) - Due date
  - `payment_date` (date, nullable) - Payment date
  - `status` (text) - Status: pending, received, overdue
  - `payment_method` (text, nullable) - Payment method
  - `installment_number` (integer, nullable) - Installment number
  - `total_installments` (integer, nullable) - Total installments
  - `parent_id` (uuid, nullable) - Reference to parent account for installments
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. Accounts Payable (Contas a Pagar)
  - `id` (uuid, primary key) - Unique identifier
  - `company_id` (uuid) - Reference to companies
  - `supplier_id` (uuid, nullable) - Reference to suppliers
  - `description` (text) - Account description
  - `category_id` (uuid, nullable) - Reference to chart of accounts
  - `cost_center_id` (uuid, nullable) - Reference to cost centers
  - `amount` (decimal) - Account amount
  - `due_date` (date) - Due date
  - `payment_date` (date, nullable) - Payment date
  - `status` (text) - Status: pending, paid, overdue
  - `payment_method` (text, nullable) - Payment method
  - `installment_number` (integer, nullable) - Installment number
  - `total_installments` (integer, nullable) - Total installments
  - `parent_id` (uuid, nullable) - Reference to parent account for installments
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. Chart of Accounts (Plano de Contas)
  - `id` (uuid, primary key) - Unique identifier
  - `company_id` (uuid) - Reference to companies
  - `code` (text) - Account code
  - `name` (text) - Account name
  - `type` (text) - Type: revenue, expense, asset, liability, equity
  - `parent_id` (uuid, nullable) - Reference to parent account
  - `active` (boolean) - Whether account is active
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 4. Cost Centers (Centros de Custo)
  - `id` (uuid, primary key) - Unique identifier
  - `company_id` (uuid) - Reference to companies
  - `code` (text) - Cost center code
  - `name` (text) - Cost center name
  - `description` (text, nullable) - Description
  - `active` (boolean) - Whether cost center is active
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 5. Bank Movements (Movimentações Bancárias)
  - `id` (uuid, primary key) - Unique identifier
  - `bank_account_id` (uuid) - Reference to bank accounts
  - `type` (text) - Type: credit, debit
  - `amount` (decimal) - Movement amount
  - `date` (date) - Movement date
  - `description` (text) - Movement description
  - `category_id` (uuid, nullable) - Reference to chart of accounts
  - `reconciled` (boolean) - Whether movement is reconciled
  - `reconciliation_date` (date, nullable) - Reconciliation date
  - `reference_type` (text, nullable) - Reference type: receivable, payable, transfer
  - `reference_id` (uuid, nullable) - Reference to account
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 6. Budget (Orçamento)
  - `id` (uuid, primary key) - Unique identifier
  - `company_id` (uuid) - Reference to companies
  - `category_id` (uuid) - Reference to chart of accounts
  - `cost_center_id` (uuid, nullable) - Reference to cost centers
  - `month` (date) - Budget month
  - `planned_amount` (decimal) - Planned amount
  - `actual_amount` (decimal) - Actual amount
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 7. Alerts (Alertas)
  - `id` (uuid, primary key) - Unique identifier
  - `company_id` (uuid) - Reference to companies
  - `type` (text) - Alert type
  - `severity` (text) - Severity: low, medium, high, critical
  - `title` (text) - Alert title
  - `message` (text) - Alert message
  - `reference_type` (text, nullable) - Reference type
  - `reference_id` (uuid, nullable) - Reference ID
  - `read` (boolean) - Whether alert is read
  - `resolved` (boolean) - Whether alert is resolved
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 8. Cash Operations (Operações de Caixa)
  - `id` (uuid, primary key) - Unique identifier
  - `company_id` (uuid) - Reference to companies
  - `bank_account_id` (uuid) - Reference to bank accounts
  - `type` (text) - Type: withdrawal, supply, card, check
  - `amount` (decimal) - Operation amount
  - `date` (date) - Operation date
  - `description` (text) - Operation description
  - `responsible` (text, nullable) - Responsible person
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 9. Corporate Expenses (Despesas Corporativas)
  - `id` (uuid, primary key) - Unique identifier
  - `company_id` (uuid) - Reference to companies
  - `employee_name` (text) - Employee name
  - `type` (text) - Type: reimbursement, advance
  - `category_id` (uuid) - Reference to chart of accounts
  - `amount` (decimal) - Expense amount
  - `expense_date` (date) - Expense date
  - `status` (text) - Status: pending, approved, paid, rejected
  - `description` (text) - Expense description
  - `receipt_url` (text, nullable) - Receipt URL
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 10. Provisions (Provisões)
  - `id` (uuid, primary key) - Unique identifier
  - `company_id` (uuid) - Reference to companies
  - `type` (text) - Provision type
  - `category_id` (uuid) - Reference to chart of accounts
  - `amount` (decimal) - Provision amount
  - `month` (date) - Provision month
  - `description` (text) - Provision description
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 11. Cash Flow Projections (Projeções de Fluxo de Caixa)
  - `id` (uuid, primary key) - Unique identifier
  - `company_id` (uuid) - Reference to companies
  - `date` (date) - Projection date
  - `projected_inflow` (decimal) - Projected inflow
  - `projected_outflow` (decimal) - Projected outflow
  - `projected_balance` (decimal) - Projected balance
  - `actual_inflow` (decimal, nullable) - Actual inflow
  - `actual_outflow` (decimal, nullable) - Actual outflow
  - `actual_balance` (decimal, nullable) - Actual balance
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 12. Audit Log (Log de Auditoria)
  - `id` (uuid, primary key) - Unique identifier
  - `company_id` (uuid) - Reference to companies
  - `user_id` (uuid) - Reference to auth.users
  - `action` (text) - Action performed
  - `table_name` (text) - Table affected
  - `record_id` (uuid, nullable) - Record ID
  - `old_data` (jsonb, nullable) - Old data
  - `new_data` (jsonb, nullable) - New data
  - `ip_address` (text, nullable) - IP address
  - `created_at` (timestamptz) - Creation timestamp
  
  ## Security
  All tables have Row Level Security (RLS) enabled with policies that:
  - Allow authenticated users to access their own company data
  - Ensure data isolation between companies
  - Maintain audit trail for all operations
*/

-- Accounts Receivable (Contas a Receber)
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  description text NOT NULL,
  category_id uuid,
  cost_center_id uuid,
  amount decimal(12,2) NOT NULL,
  due_date date NOT NULL,
  payment_date date,
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  installment_number integer,
  total_installments integer,
  parent_id uuid REFERENCES accounts_receivable(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_receivable_status CHECK (status IN ('pending', 'received', 'overdue'))
);

ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage receivables from their companies"
  ON accounts_receivable FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = accounts_receivable.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Accounts Payable (Contas a Pagar)
CREATE TABLE IF NOT EXISTS accounts_payable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  description text NOT NULL,
  category_id uuid,
  cost_center_id uuid,
  amount decimal(12,2) NOT NULL,
  due_date date NOT NULL,
  payment_date date,
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  installment_number integer,
  total_installments integer,
  parent_id uuid REFERENCES accounts_payable(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_payable_status CHECK (status IN ('pending', 'paid', 'overdue'))
);

ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage payables from their companies"
  ON accounts_payable FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = accounts_payable.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Chart of Accounts (Plano de Contas)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  parent_id uuid REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_account_type CHECK (type IN ('revenue', 'expense', 'asset', 'liability', 'equity'))
);

ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage chart of accounts from their companies"
  ON chart_of_accounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = chart_of_accounts.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Cost Centers (Centros de Custo)
CREATE TABLE IF NOT EXISTS cost_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage cost centers from their companies"
  ON cost_centers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = cost_centers.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Bank Movements (Movimentações Bancárias)
CREATE TABLE IF NOT EXISTS bank_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id uuid REFERENCES bank_accounts(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  amount decimal(12,2) NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category_id uuid,
  reconciled boolean DEFAULT false,
  reconciliation_date date,
  reference_type text,
  reference_id uuid,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_movement_type CHECK (type IN ('credit', 'debit')),
  CONSTRAINT valid_reference_type CHECK (reference_type IS NULL OR reference_type IN ('receivable', 'payable', 'transfer'))
);

ALTER TABLE bank_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage bank movements from their companies"
  ON bank_movements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bank_accounts
      JOIN companies ON companies.id = bank_accounts.company_id
      WHERE bank_accounts.id = bank_movements.bank_account_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Budget (Orçamento)
CREATE TABLE IF NOT EXISTS budget (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  category_id uuid NOT NULL,
  cost_center_id uuid,
  month date NOT NULL,
  planned_amount decimal(12,2) NOT NULL DEFAULT 0,
  actual_amount decimal(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE budget ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage budget from their companies"
  ON budget FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = budget.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Alerts (Alertas)
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  severity text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  reference_type text,
  reference_id uuid,
  read boolean DEFAULT false,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage alerts from their companies"
  ON alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = alerts.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Cash Operations (Operações de Caixa)
CREATE TABLE IF NOT EXISTS cash_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  bank_account_id uuid REFERENCES bank_accounts(id) ON DELETE SET NULL,
  type text NOT NULL,
  amount decimal(12,2) NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  responsible text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_operation_type CHECK (type IN ('withdrawal', 'supply', 'card', 'check'))
);

ALTER TABLE cash_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage cash operations from their companies"
  ON cash_operations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = cash_operations.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Corporate Expenses (Despesas Corporativas)
CREATE TABLE IF NOT EXISTS corporate_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  employee_name text NOT NULL,
  type text NOT NULL,
  category_id uuid,
  amount decimal(12,2) NOT NULL,
  expense_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  description text NOT NULL,
  receipt_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_corporate_expense_type CHECK (type IN ('reimbursement', 'advance')),
  CONSTRAINT valid_corporate_expense_status CHECK (status IN ('pending', 'approved', 'paid', 'rejected'))
);

ALTER TABLE corporate_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage corporate expenses from their companies"
  ON corporate_expenses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = corporate_expenses.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Provisions (Provisões)
CREATE TABLE IF NOT EXISTS provisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  category_id uuid,
  amount decimal(12,2) NOT NULL,
  month date NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE provisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage provisions from their companies"
  ON provisions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = provisions.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Cash Flow Projections (Projeções de Fluxo de Caixa)
CREATE TABLE IF NOT EXISTS cash_flow_projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  projected_inflow decimal(12,2) NOT NULL DEFAULT 0,
  projected_outflow decimal(12,2) NOT NULL DEFAULT 0,
  projected_balance decimal(12,2) NOT NULL DEFAULT 0,
  actual_inflow decimal(12,2),
  actual_outflow decimal(12,2),
  actual_balance decimal(12,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cash_flow_projections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage cash flow projections from their companies"
  ON cash_flow_projections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = cash_flow_projections.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Audit Log (Log de Auditoria)
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit log from their companies"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = audit_log.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Add foreign key constraints for category_id and cost_center_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'accounts_receivable_category_id_fkey'
  ) THEN
    ALTER TABLE accounts_receivable
    ADD CONSTRAINT accounts_receivable_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'accounts_receivable_cost_center_id_fkey'
  ) THEN
    ALTER TABLE accounts_receivable
    ADD CONSTRAINT accounts_receivable_cost_center_id_fkey
    FOREIGN KEY (cost_center_id) REFERENCES cost_centers(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'accounts_payable_category_id_fkey'
  ) THEN
    ALTER TABLE accounts_payable
    ADD CONSTRAINT accounts_payable_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'accounts_payable_cost_center_id_fkey'
  ) THEN
    ALTER TABLE accounts_payable
    ADD CONSTRAINT accounts_payable_cost_center_id_fkey
    FOREIGN KEY (cost_center_id) REFERENCES cost_centers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_company_id ON accounts_receivable(company_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_status ON accounts_receivable(status);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_due_date ON accounts_receivable(due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_company_id ON accounts_payable(company_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_status ON accounts_payable(status);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_company_id ON chart_of_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_company_id ON cost_centers(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_movements_bank_account_id ON bank_movements(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_movements_date ON bank_movements(date);
CREATE INDEX IF NOT EXISTS idx_budget_company_id ON budget(company_id);
CREATE INDEX IF NOT EXISTS idx_budget_month ON budget(month);
CREATE INDEX IF NOT EXISTS idx_alerts_company_id ON alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(read);
CREATE INDEX IF NOT EXISTS idx_cash_operations_company_id ON cash_operations(company_id);
CREATE INDEX IF NOT EXISTS idx_corporate_expenses_company_id ON corporate_expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_provisions_company_id ON provisions(company_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_projections_company_id ON cash_flow_projections(company_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_projections_date ON cash_flow_projections(date);
CREATE INDEX IF NOT EXISTS idx_audit_log_company_id ON audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);