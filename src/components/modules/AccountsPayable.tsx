import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, DollarSign, User, AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AccountPayable, Customer } from '../../types/database';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function AccountsPayable() {
  const [payables, setReceivables] = useState<(AccountPayable & { supplier?: Customer })[]>([]);
  const [suppliers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AccountPayable | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>('');

  const [formData, setFormData] = useState({
    description: '',
    supplier_id: '',
    amount: '',
    due_date: '',
    payment_date: '',
    status: 'pending' as 'pending' | 'paid' | 'overdue',
    payment_method: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

      setCompanyId(companies.id);

      const [payablesData, suppliersData] = await Promise.all([
        supabase
          .from('accounts_payable')
          .select('*, suppliers(*)')
          .eq('company_id', companies.id)
          .order('due_date', { ascending: true }),
        supabase
          .from('suppliers')
          .select('*')
          .eq('company_id', companies.id)
          .order('name', { ascending: true }),
      ]);

      setReceivables((payablesData.data || []).map((item: any) => ({
        ...item,
        supplier: item.suppliers,
      })));
      setCustomers(suppliersData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      company_id: companyId,
      description: formData.description,
      supplier_id: formData.supplier_id || null,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      payment_date: formData.payment_date || null,
      status: formData.status,
      payment_method: formData.payment_method || null,
      notes: formData.notes || null,
    };

    try {
      if (editingItem) {
        await supabase
          .from('accounts_payable')
          .update(data)
          .eq('id', editingItem.id);
      } else {
        await supabase.from('accounts_payable').insert([data]);
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erro ao salvar conta a receber');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await supabase.from('accounts_payable').delete().eq('id', deletingId);
      await loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Erro ao excluir conta a receber');
    }
  };

  const handleEdit = (item: AccountPayable) => {
    setEditingItem(item);
    setFormData({
      description: item.description,
      supplier_id: item.supplier_id || '',
      amount: item.amount.toString(),
      due_date: item.due_date,
      payment_date: item.payment_date || '',
      status: item.status,
      payment_method: item.payment_method || '',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      description: '',
      supplier_id: '',
      amount: '',
      due_date: '',
      payment_date: '',
      status: 'pending',
      payment_method: '',
      notes: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: 'Pago',
      pending: 'Pendente',
      overdue: 'Vencido',
    };
    return labels[status] || status;
  };

  const totalReceivable = payables.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalReceived = payables.filter((r) => r.status === 'paid').reduce((sum, r) => sum + Number(r.amount), 0);
  const totalPending = payables.filter((r) => r.status === 'pending').reduce((sum, r) => sum + Number(r.amount), 0);
  const totalOverdue = payables.filter((r) => r.status === 'overdue').reduce((sum, r) => sum + Number(r.amount), 0);

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
          <h2 className="text-2xl font-bold text-gray-900">Contas a Pagar</h2>
          <p className="text-gray-600 mt-1">Gerencie suas despesas e pagamentos</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white px-6 py-3 rounded-lg hover:from-[#b8934f] hover:to-[#c4a056] transition-all duration-200 flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Nova Conta a Pagar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total a Receber</p>
            <TrendingUp className="text-blue-500" size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceivable)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{payables.length} contas</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pago</p>
            <CheckCircle className="text-green-500" size={24} />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceived)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{payables.filter((r) => r.status === 'paid').length} contas</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pendente</p>
            <AlertCircle className="text-yellow-500" size={24} />
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{payables.filter((r) => r.status === 'pending').length} contas</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Vencido</p>
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOverdue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{payables.filter((r) => r.status === 'overdue').length} contas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Descrição</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Fornecedor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vencimento</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payables.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500">Nenhuma conta a receber cadastrada</p>
                  </td>
                </tr>
              ) : (
                payables.map((payable) => (
                  <tr key={payable.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{payable.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-gray-700">{payable.supplier?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-700">{new Date(payable.due_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(payable.amount))}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payable.status)}`}>
                        {getStatusLabel(payable.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(payable)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(payable.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor</label>
            <select
              value={formData.supplier_id}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
            >
              <option value="">Selecione um cliente</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Vencimento *</label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Pagamento</label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
            <input
              type="text"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white rounded-lg hover:from-[#b8934f] hover:to-[#c4a056] transition-colors font-medium"
            >
              {editingItem ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title="Excluir Conta a Pagar"
        message="Tem certeza que deseja excluir esta conta a receber? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
