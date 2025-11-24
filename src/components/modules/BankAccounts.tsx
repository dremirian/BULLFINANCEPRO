import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Building2, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface BankAccount {
  id: string;
  company_id: string;
  bank_name: string;
  account_number: string;
  account_type: string;
  initial_balance: number;
  current_balance: number;
  active: boolean;
  created_at: string;
}

export function BankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    account_type: 'corrente',
    initial_balance: 0,
    active: true,
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
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
        .from('bank_accounts')
        .select('*')
        .eq('company_id', companies.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
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

      if (editingAccount) {
        const { error } = await supabase
          .from('bank_accounts')
          .update({
            ...formData,
            current_balance: formData.initial_balance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAccount.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bank_accounts')
          .insert({
            ...formData,
            company_id: companies.id,
            current_balance: formData.initial_balance,
          });

        if (error) throw error;
      }

      setShowModal(false);
      setEditingAccount(null);
      setFormData({
        bank_name: '',
        account_number: '',
        account_type: 'corrente',
        initial_balance: 0,
        active: true,
      });
      loadAccounts();
    } catch (error) {
      console.error('Error saving bank account:', error);
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      bank_name: account.bank_name,
      account_number: account.account_number,
      account_type: account.account_type,
      initial_balance: account.initial_balance,
      active: account.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadAccounts();
    } catch (error) {
      console.error('Error deleting bank account:', error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.current_balance), 0);
  const activeAccounts = accounts.filter(acc => acc.active).length;

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
          <h2 className="text-2xl font-bold text-gray-900">Contas Bancárias</h2>
          <p className="text-gray-600 mt-1">Gerencie suas contas bancárias e saldos</p>
        </div>
        <button
          onClick={() => {
            setEditingAccount(null);
            setFormData({
              bank_name: '',
              account_number: '',
              account_type: 'corrente',
              initial_balance: 0,
              active: true,
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white px-6 py-3 rounded-lg hover:from-[#b8934f] hover:to-[#c4a056] transition-all shadow-lg"
        >
          <Plus size={20} />
          Nova Conta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-100">Saldo Total</p>
            <Wallet size={24} />
          </div>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalBalance)}
          </p>
          <p className="text-xs text-blue-100 mt-1">Consolidado de todas as contas</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-100">Contas Ativas</p>
            <Building2 size={24} />
          </div>
          <p className="text-3xl font-bold">{activeAccounts}</p>
          <p className="text-xs text-green-100 mt-1">Total de {accounts.length} contas</p>
        </div>

        <div className="bg-gradient-to-br from-[#c8a35f] to-[#d4b066] p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-100">Média por Conta</p>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(activeAccounts > 0 ? totalBalance / activeAccounts : 0)}
          </p>
          <p className="text-xs text-amber-100 mt-1">Saldo médio por conta</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Banco
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Número da Conta
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Saldo Inicial
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Saldo Atual
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Building2 className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-lg font-medium">Nenhuma conta bancária cadastrada</p>
                    <p className="text-sm mt-2">Clique em "Nova Conta" para começar</p>
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Building2 className="text-blue-600" size={20} />
                        </div>
                        <span className="font-medium text-gray-900">{account.bank_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{account.account_number}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {account.account_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(account.initial_balance)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${
                        account.current_balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(account.current_balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {account.active ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          Inativa
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(account)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(account.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
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
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAccount(null);
        }}
        title={editingAccount ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Banco
            </label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              placeholder="Ex: Banco do Brasil, Itaú, Nubank"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número da Conta
            </label>
            <input
              type="text"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              placeholder="Ex: 12345-6"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Conta
            </label>
            <select
              value={formData.account_type}
              onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
            >
              <option value="corrente">Conta Corrente</option>
              <option value="poupanca">Conta Poupança</option>
              <option value="investimento">Conta Investimento</option>
              <option value="digital">Conta Digital</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Saldo Inicial
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.initial_balance}
              onChange={(e) => setFormData({ ...formData, initial_balance: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              placeholder="0.00"
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
              Conta ativa
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingAccount(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white rounded-lg hover:from-[#b8934f] hover:to-[#c4a056] transition-all"
            >
              {editingAccount ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Excluir Conta Bancária"
        message="Tem certeza que deseja excluir esta conta bancária? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
