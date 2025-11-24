export interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  logo_url?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  cpf_cnpj: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  company_id: string;
  name: string;
  cnpj: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost: number;
  quantity: number;
  unit: string;
  category?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  company_id: string;
  customer_id?: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  payment_date?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface Expense {
  id: string;
  company_id: string;
  supplier_id?: string;
  description: string;
  category: string;
  amount: number;
  expense_date: string;
  due_date?: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  company_id: string;
  name: string;
  bank_name: string;
  account_number: string;
  balance: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  company_id: string;
  bank_account_id?: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  transaction_date: string;
  reference_id?: string;
  reference_type?: 'invoice' | 'expense';
  notes?: string;
  created_at: string;
}

export interface AccountReceivable {
  id: string;
  company_id: string;
  customer_id?: string;
  description: string;
  category_id?: string;
  cost_center_id?: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'received' | 'overdue';
  payment_method?: string;
  installment_number?: number;
  total_installments?: number;
  parent_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountPayable {
  id: string;
  company_id: string;
  supplier_id?: string;
  description: string;
  category_id?: string;
  cost_center_id?: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_method?: string;
  installment_number?: number;
  total_installments?: number;
  parent_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ChartOfAccount {
  id: string;
  company_id: string;
  code: string;
  name: string;
  type: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';
  parent_id?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CostCenter {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankMovement {
  id: string;
  bank_account_id: string;
  type: 'credit' | 'debit';
  amount: number;
  date: string;
  description: string;
  category_id?: string;
  reconciled: boolean;
  reconciliation_date?: string;
  reference_type?: 'receivable' | 'payable' | 'transfer';
  reference_id?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  company_id: string;
  category_id: string;
  cost_center_id?: string;
  month: string;
  planned_amount: number;
  actual_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  company_id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
  read: boolean;
  resolved: boolean;
  created_at: string;
}

export interface CashOperation {
  id: string;
  company_id: string;
  bank_account_id?: string;
  type: 'withdrawal' | 'supply' | 'card' | 'check';
  amount: number;
  date: string;
  description: string;
  responsible?: string;
  created_at: string;
}

export interface CorporateExpense {
  id: string;
  company_id: string;
  employee_name: string;
  type: 'reimbursement' | 'advance';
  category_id?: string;
  amount: number;
  expense_date: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  description: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Provision {
  id: string;
  company_id: string;
  type: string;
  category_id?: string;
  amount: number;
  month: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CashFlowProjection {
  id: string;
  company_id: string;
  date: string;
  projected_inflow: number;
  projected_outflow: number;
  projected_balance: number;
  actual_inflow?: number;
  actual_outflow?: number;
  actual_balance?: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  created_at: string;
}
