import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, RefreshCw, Play, Pause, Calendar } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface RecurringTransaction {
  id: string;
  company_id: string;
  type: string;
  description: string;
  amount: number;
  frequency: string;
  start_date: string;
  end_date: string | null;
  customer_id: string | null;
  supplier_id: string | null;
  category: string | null;
  payment_method: string | null;
  active: boolean;
  last_generated: string | null;
  created_at: string;
}

export function RecurringTransactions() {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'receivable',
    description: '',
    amount: 0,
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    category: '',
    payment_method: '',
    active: true,
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.user.id)
        .maybeSingle();

      if (!companies) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('company_id', companies.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading recurring transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.user.id)
        .maybeSingle();

      if (!companies) return;

      const payload = {
        ...formData,
        company_id: companies.id,
        end_date: formData.end_date || null,
      };

      if (editingTransaction) {
        const { error } = await supabase
          .from('recurring_transactions')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editingTransaction.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('recurring_transactions')
          .insert(payload);

        if (error) throw error;
      }

      setShowModal(false);
      setEditingTransaction(null);
      resetForm();
      loadTransactions();
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'receivable',
      description: '',
      amount: 0,
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      category: '',
      payment_method: '',
      active: true,
    });
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount,
      frequency: transaction.frequency,
      start_date: transaction.start_date,
      end_date: transaction.end_date || '',
      category: transaction.category || '',
      payment_method: transaction.payment_method || '',
      active: transaction.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadTransactions();
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({ active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      loadTransactions();
    } catch (error) {
      console.error('Error toggling recurring transaction:', error);
    }
  };

  const generateTransactions = async (recurringId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.user.id)
        .maybeSingle();

      if (!companies) return;

      const recurring = transactions.find(t => t.id === recurringId);
      if (!recurring) return;

      const today = new Date();
      const lastGen = recurring.last_generated ? new Date(recurring.last_generated) : new Date(recurring.start_date);

      let nextDate = new Date(lastGen);

      switch (recurring.frequency) {
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'annual':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      if (nextDate <= today) {
        if (recurring.type === 'receivable') {
          await supabase.from('accounts_receivable').insert({
            company_id: companies.id,
            customer_id: recurring.customer_id,
            description: `${recurring.description} (Recorrente)`,
            amount: recurring.amount,
            due_date: nextDate.toISOString().split('T')[0],
            status: 'pending',
            payment_method: recurring.payment_method,
          });
        } else {
          await supabase.from('accounts_payable').insert({
            company_id: companies.id,
            supplier_id: recurring.supplier_id,
            description: `${recurring.description} (Recorrente)`,
            amount: recurring.amount,
            due_date: nextDate.toISOString().split('T')[0],
            status: 'pending',
            payment_method: recurring.payment_method,
          });
        }

        await supabase
          .from('recurring_transactions')
          .update({ last_generated: nextDate.toISOString().split('T')[0] })
          .eq('id', recurringId);

        alert('Transação gerada com sucesso!');
        loadTransactions();
      } else {
        alert('Próxima geração agendada para ' + nextDate.toLocaleDateString('pt-BR'));
      }
    } catch (error) {
      console.error('Error generating transaction:', error);
      alert('Erro ao gerar transação');
    }
  };

  const activeCount = transactions.filter(t => t.active).length;
  const receivableCount = transactions.filter(t => t.type === 'receivable').length;
  const payableCount = transactions.filter(t => t.type === 'payable').length;
  const totalMonthly = transactions
    .filter(t => t.active && t.frequency === 'monthly')
    .reduce((sum, t) => sum + (t.type === 'receivable' ? t.amount : -t.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#c8a35f] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transações Recorrentes</h2>
          <p className="text-gray-600 mt-1">Automatize receitas e despesas fixas</p>
        </div>
        <button
          onClick={() => {
            setEditingTransaction(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white px-6 py-3 rounded-lg hover:from-[#b8934f] hover:to-[#c4a056] transition-all shadow-lg"
        >
          <Plus size={20} />
          Nova Recorrência
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-100">Ativas</p>
            <RefreshCw size={24} />
          </div>
          <p className="text-3xl font-bold">{activeCount}</p>
          <p className="text-xs text-blue-100 mt-1">Total: {transactions.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-100">Receitas</p>
            <Calendar size={24} />
          </div>
          <p className="text-3xl font-bold">{receivableCount}</p>
          <p className="text-xs text-green-100 mt-1">Recorrências de entrada</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-100">Despesas</p>
            <Calendar size={24} />
          </div>
          <p className="text-3xl font-bold">{payableCount}</p>
          <p className="text-xs text-red-100 mt-1">Recorrências de saída</p>
        </div>

        <div className="bg-gradient-to-br from-[#c8a35f] to-[#d4b066] p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-100">Impacto Mensal</p>
            <RefreshCw size={24} />
          </div>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalMonthly)}
          </p>
          <p className="text-xs text-amber-100 mt-1">Apenas mensais ativas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Descrição</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Valor</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Frequência</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Próxima</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-lg font-medium">Nenhuma recorrência cadastrada</p>
                    <p className="text-sm mt-2">Crie recorrências para automatizar receitas e despesas fixas</p>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const lastGen = transaction.last_generated ? new Date(transaction.last_generated) : new Date(transaction.start_date);
                  let nextDate = new Date(lastGen);

                  switch (transaction.frequency) {
                    case 'weekly':
                      nextDate.setDate(nextDate.getDate() + 7);
                      break;
                    case 'monthly':
                      nextDate.setMonth(nextDate.getMonth() + 1);
                      break;
                    case 'quarterly':
                      nextDate.setMonth(nextDate.getMonth() + 3);
                      break;
                    case 'annual':
                      nextDate.setFullYear(nextDate.getFullYear() + 1);
                      break;
                  }

                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{transaction.description}</div>
                          {transaction.category && (
                            <div className="text-gray-500">{transaction.category}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {transaction.type === 'receivable' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Receita
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Despesa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-semibold ${
                          transaction.type === 'receivable' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                          {transaction.frequency === 'weekly' && 'Semanal'}
                          {transaction.frequency === 'monthly' && 'Mensal'}
                          {transaction.frequency === 'quarterly' && 'Trimestral'}
                          {transaction.frequency === 'annual' && 'Anual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        {nextDate.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {transaction.active ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Ativa
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            Pausada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => generateTransactions(transaction.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Gerar agora"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button
                            onClick={() => toggleActive(transaction.id, transaction.active)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title={transaction.active ? 'Pausar' : 'Ativar'}
                          >
                            {transaction.active ? <Pause size={18} /> : <Play size={18} />}
                          </button>
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(transaction.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Editar Recorrência' : 'Nova Recorrência'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
            >
              <option value="receivable">Receita (Contas a Receber)</option>
              <option value="payable">Despesa (Contas a Pagar)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              placeholder="Ex: Aluguel, Internet, Mensalidade"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequência</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="annual">Anual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim (opcional)</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria (opcional)</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              placeholder="Ex: Serviços, Infraestrutura"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pagamento (opcional)</label>
            <input
              type="text"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              placeholder="Ex: Boleto, Cartão, Pix"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="rounded border-gray-300 text-[#c8a35f] focus:ring-[#c8a35f]"
            />
            <label htmlFor="active" className="text-sm text-gray-700">
              Ativar recorrência
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingTransaction(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white rounded-lg hover:from-[#b8934f] hover:to-[#c4a056] transition-all"
            >
              {editingTransaction ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Excluir Recorrência"
        message="Tem certeza que deseja excluir esta recorrência? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
