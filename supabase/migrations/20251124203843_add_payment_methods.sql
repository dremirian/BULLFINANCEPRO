/*
  # Adicionar Formas de Pagamento ao Sistema

  1. Alterações
    - Adiciona tabela `payment_methods` com todas as formas de pagamento possíveis
    - Adiciona coluna `payment_method_id` nas tabelas de transações
    - Cria índices para melhor performance
    
  2. Tabela Nova
    - `payment_methods`
      - `id` (uuid, primary key)
      - `name` (text, nome da forma de pagamento)
      - `type` (text, tipo: debit, credit, pix, boleto, cash, transfer, check, outros)
      - `icon` (text, ícone lucide-react)
      - `is_active` (boolean, se está ativo)
      - `company_id` (uuid, referência à empresa)
      - `created_at` (timestamp)

  3. Alterações em Tabelas Existentes
    - Adiciona `payment_method_id` em `accounts_receivable`
    - Adiciona `payment_method_id` em `accounts_payable`
    - Adiciona `payment_method_id` em `bank_movements`
    - Adiciona `payment_method_id` em `expenses`

  4. Segurança
    - RLS habilitado para `payment_methods`
    - Políticas restritivas por empresa autenticada
    - Apenas o dono da empresa pode visualizar e gerenciar

  5. Formas de Pagamento Disponíveis
    - Cartão de Débito
    - Cartão de Crédito
    - PIX
    - Boleto Bancário
    - Dinheiro/Espécie
    - Transferência Bancária
    - Cheque
    - Outros
*/

-- Criar tabela de formas de pagamento
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('debit', 'credit', 'pix', 'boleto', 'cash', 'transfer', 'check', 'outros')),
  icon text NOT NULL DEFAULT 'DollarSign',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para payment_methods
CREATE POLICY "Users can view own company payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company payment methods"
  ON payment_methods FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
  );

-- Adicionar coluna payment_method_id nas tabelas existentes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts_receivable' AND column_name = 'payment_method_id'
  ) THEN
    ALTER TABLE accounts_receivable ADD COLUMN payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts_payable' AND column_name = 'payment_method_id'
  ) THEN
    ALTER TABLE accounts_payable ADD COLUMN payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bank_movements' AND column_name = 'payment_method_id'
  ) THEN
    ALTER TABLE bank_movements ADD COLUMN payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'payment_method_id'
  ) THEN
    ALTER TABLE expenses ADD COLUMN payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_company_id ON payment_methods(company_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_payment_method ON accounts_receivable(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_payment_method ON accounts_payable(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_bank_movements_payment_method ON bank_movements(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_method ON expenses(payment_method_id);
