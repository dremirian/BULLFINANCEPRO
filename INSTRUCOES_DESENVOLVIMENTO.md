# Bull Finance - Instruções de Desenvolvimento

## Sistema Implementado

A plataforma Bull Finance está funcionando com:

### ✅ Módulos Completos com CRUD
- **Contas a Receber** - Criar, Editar, Excluir (100% funcional)
- **Dashboard Principal** - Visão geral com KPIs
- **Fluxo de Caixa** - Projeções e análises
- **DRE** - Demonstração de resultados
- **Alertas** - Central de notificações
- **Relatórios** - Análises financeiras

### 🚧 Módulos Que Precisam de CRUD Completo
- Contas a Pagar
- Clientes
- Fornecedores
- Produtos
- Notas Fiscais
- Despesas
- Transações
- Contas Bancárias
- Configurações

## Como Implementar CRUD nos Outros Módulos

O módulo **Contas a Receber** (`/src/components/modules/AccountsReceivable.tsx`) serve como template perfeito. Siga este padrão:

### 1. Estrutura Básica

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function SeuModulo() {
  // Estados
  const [items, setItems] = useState<TipoDoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TipoDoItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>('');
  const [formData, setFormData] = useState({...});

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Buscar companyId
    const { data: user } = await supabase.auth.getUser();
    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.user.id)
      .maybeSingle();

    setCompanyId(companies.id);

    // Buscar itens
    const { data } = await supabase
      .from('sua_tabela')
      .select('*')
      .eq('company_id', companies.id);

    setItems(data || []);
  };

  // Salvar (criar ou editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      company_id: companyId,
      ...formData
    };

    if (editingItem) {
      await supabase
        .from('sua_tabela')
        .update(data)
        .eq('id', editingItem.id);
    } else {
      await supabase
        .from('sua_tabela')
        .insert([data]);
    }

    await loadData();
    handleCloseModal();
  };

  // Excluir
  const handleDelete = async () => {
    await supabase
      .from('sua_tabela')
      .delete()
      .eq('id', deletingId);

    await loadData();
  };

  // Editar
  const handleEdit = (item: TipoDoItem) => {
    setEditingItem(item);
    setFormData({...item});
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com botão Adicionar */}
      {/* Cards de estatísticas */}
      {/* Tabela com dados */}
      {/* Modal de formulário */}
      {/* Dialog de confirmação de exclusão */}
    </div>
  );
}
```

### 2. Componentes UI Disponíveis

#### Modal
```typescript
<Modal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  title="Título do Modal"
>
  <form onSubmit={handleSubmit}>
    {/* Campos do formulário */}
  </form>
</Modal>
```

#### Confirm Dialog
```typescript
<ConfirmDialog
  isOpen={isDeleteDialogOpen}
  onClose={() => setIsDeleteDialogOpen(false)}
  onConfirm={handleDelete}
  title="Confirmar Exclusão"
  message="Tem certeza?"
/>
```

### 3. Padrão de Formulário

```typescript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Nome do Campo *
  </label>
  <input
    type="text"
    required
    value={formData.campo}
    onChange={(e) => setFormData({ ...formData, campo: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
  />
</div>
```

### 4. Botões de Ação na Tabela

```typescript
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2">
    <button
      onClick={() => handleEdit(item)}
      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
    >
      <Edit size={18} className="text-blue-600" />
    </button>
    <button
      onClick={() => {
        setDeletingId(item.id);
        setIsDeleteDialogOpen(true);
      }}
      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
    >
      <Trash2 size={18} className="text-red-600" />
    </button>
  </div>
</td>
```

## Banco de Dados

### Tabelas Disponíveis

Todas as tabelas já estão criadas no Supabase com RLS habilitado:

- `companies` - Empresas
- `customers` - Clientes
- `suppliers` - Fornecedores
- `products` - Produtos
- `invoices` - Notas Fiscais
- `invoice_items` - Itens de NF
- `expenses` - Despesas
- `accounts_receivable` - Contas a Receber
- `accounts_payable` - Contas a Pagar
- `bank_accounts` - Contas Bancárias
- `bank_movements` - Movimentações Bancárias
- `transactions` - Transações
- `chart_of_accounts` - Plano de Contas
- `cost_centers` - Centros de Custo
- `budget` - Orçamento
- `alerts` - Alertas
- `cash_operations` - Operações de Caixa
- `corporate_expenses` - Despesas Corporativas
- `provisions` - Provisões
- `cash_flow_projections` - Projeções de Fluxo
- `audit_log` - Log de Auditoria

### Tipos TypeScript

Todos os tipos estão definidos em `/src/types/database.ts`

## Como Rodar o Projeto

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Autenticação

O sistema usa Supabase Auth com email/senha:
- Login automático salva sessão
- RLS garante isolamento entre empresas
- Cada usuário só vê dados da sua empresa

## Próximos Passos

1. **Implementar CRUD completo em:**
   - Contas a Pagar (copiar padrão de Contas a Receber)
   - Clientes
   - Fornecedores
   - Produtos
   - etc.

2. **Melhorias sugeridas:**
   - Validações de formulário mais robustas
   - Mensagens de sucesso/erro mais elaboradas
   - Filtros e busca nas tabelas
   - Paginação para grandes volumes
   - Exportação de dados (PDF/Excel)

3. **Integrações futuras:**
   - Upload de arquivos (notas, recibos)
   - Envio de emails automáticos
   - Notificações push
   - Relatórios avançados com gráficos

## Estrutura de Pastas

```
src/
├── components/
│   ├── auth/           # Autenticação
│   ├── dashboard/      # Layout do dashboard
│   ├── modules/        # Módulos funcionais
│   └── ui/            # Componentes reutilizáveis
├── contexts/          # Context API
├── lib/              # Configurações (Supabase)
└── types/            # TypeScript types
```

## Suporte

O código está bem documentado e seguindo boas práticas React/TypeScript.
Use o módulo AccountsReceivable.tsx como referência para implementar os demais.
