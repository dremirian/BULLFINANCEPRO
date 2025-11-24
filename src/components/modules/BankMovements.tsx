import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Download, Upload, ArrowUpCircle, ArrowDownCircle, Filter, Calendar } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
}

interface BankMovement {
  id: string;
  bank_account_id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  category_id: string | null;
  reconciled: boolean;
  bank_accounts: {
    bank_name: string;
    account_number: string;
  };
}

export function BankMovements() {
  const [movements, setMovements] = useState<BankMovement[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const [formData, setFormData] = useState({
    bank_account_id: '',
    type: 'credit',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [importData, setImportData] = useState({
    bank_account_id: '',
    csv_data: '',
  });

  useEffect(() => {
    loadData();
  }, [selectedAccount, filterType]);

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

      const { data: accountsData } = await supabase
        .from('bank_accounts')
        .select('id, bank_name, account_number')
        .eq('company_id', companies.id)
        .eq('active', true);

      setAccounts(accountsData || []);

      let query = supabase
        .from('bank_movements')
        .select(`
          *,
          bank_accounts (
            bank_name,
            account_number
          )
        `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (selectedAccount !== 'all') {
        query = query.eq('bank_account_id', selectedAccount);
      } else {
        const accountIds = accountsData?.map(acc => acc.id) || [];
        if (accountIds.length > 0) {
          query = query.in('bank_account_id', accountIds);
        }
      }

      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('bank_movements')
        .insert({
          ...formData,
          reconciled: false,
        });

      if (error) throw error;

      await updateAccountBalance(formData.bank_account_id, formData.type, formData.amount);

      setShowModal(false);
      setFormData({
        bank_account_id: '',
        type: 'credit',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      loadData();
    } catch (error) {
      console.error('Error saving movement:', error);
    }
  };

  const updateAccountBalance = async (accountId: string, type: string, amount: number) => {
    try {
      const { data: account } = await supabase
        .from('bank_accounts')
        .select('current_balance')
        .eq('id', accountId)
        .single();

      if (!account) return;

      const newBalance = type === 'credit'
        ? account.current_balance + amount
        : account.current_balance - amount;

      await supabase
        .from('bank_accounts')
        .update({ current_balance: newBalance })
        .eq('id', accountId);
    } catch (error) {
      console.error('Error updating account balance:', error);
    }
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const lines = importData.csv_data.trim().split('\n');
      const movements = lines.slice(1).map(line => {
        const [date, description, amount, type] = line.split(',').map(s => s.trim());
        return {
          bank_account_id: importData.bank_account_id,
          date,
          description,
          amount: Math.abs(parseFloat(amount)),
          type: parseFloat(amount) >= 0 ? 'credit' : 'debit',
          reconciled: false,
        };
      });

      for (const movement of movements) {
        await supabase.from('bank_movements').insert(movement);
        await updateAccountBalance(movement.bank_account_id, movement.type, movement.amount);
      }

      setShowImportModal(false);
      setImportData({ bank_account_id: '', csv_data: '' });
      loadData();
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Erro ao importar CSV. Verifique o formato do arquivo.');
    }
  };

  const totalCredit = movements
    .filter(m => m.type === 'credit')
    .reduce((sum, m) => sum + Number(m.amount), 0);

  const totalDebit = movements
    .filter(m => m.type === 'debit')
    .reduce((sum, m) => sum + Number(m.amount), 0);

  const balance = totalCredit - totalDebit;

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
          <h2 className="text-2xl font-bold text-gray-900">Movimentações Bancárias</h2>
          <p className="text-gray-600 mt-1">Extrato completo de todas as movimentações</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-white border-2 border-[#c8a35f] text-[#c8a35f] px-6 py-3 rounded-lg hover:bg-[#c8a35f] hover:text-white transition-all"
          >
            <Upload size={20} />
            Importar CSV
          </button>
          <button
            onClick={() => {
              setFormData({
                bank_account_id: accounts[0]?.id || '',
                type: 'credit',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                description: '',
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white px-6 py-3 rounded-lg hover:from-[#b8934f] hover:to-[#c4a056] transition-all shadow-lg"
          >
            <Plus size={20} />
            Nova Movimentação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-100">Total de Entradas</p>
            <ArrowUpCircle size={24} />
          </div>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalCredit)}
          </p>
          <p className="text-xs text-green-100 mt-1">Créditos no período</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-100">Total de Saídas</p>
            <ArrowDownCircle size={24} />
          </div>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalDebit)}
          </p>
          <p className="text-xs text-red-100 mt-1">Débitos no período</p>
        </div>

        <div className="bg-gradient-to-br from-[#c8a35f] to-[#d4b066] p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-100">Saldo Período</p>
            <Calendar size={24} />
          </div>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(balance)}
          </p>
          <p className="text-xs text-amber-100 mt-1">Diferença entradas - saídas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Conta
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
            >
              <option value="all">Todas as contas</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.bank_name} - {account.account_number}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Movimentação
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="credit">Apenas Entradas</option>
              <option value="debit">Apenas Saídas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Conta</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Descrição</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Valor</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-lg font-medium">Nenhuma movimentação encontrada</p>
                    <p className="text-sm mt-2">Adicione movimentações ou importe um extrato</p>
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(movement.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <div className="text-sm">
                        <div className="font-medium">{movement.bank_accounts.bank_name}</div>
                        <div className="text-gray-500">{movement.bank_accounts.account_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{movement.description}</td>
                    <td className="px-6 py-4 text-center">
                      {movement.type === 'credit' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <ArrowUpCircle size={14} />
                          Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <ArrowDownCircle size={14} />
                          Saída
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${
                        movement.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.type === 'credit' ? '+' : '-'}
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(movement.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {movement.reconciled ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Conciliado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          Pendente
                        </span>
                      )}
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
        onClose={() => setShowModal(false)}
        title="Nova Movimentação Bancária"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conta Bancária</label>
            <select
              value={formData.bank_account_id}
              onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              required
            >
              <option value="">Selecione uma conta</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.bank_name} - {account.account_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
            >
              <option value="credit">Entrada (Crédito)</option>
              <option value="debit">Saída (Débito)</option>
            </select>
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white rounded-lg hover:from-[#b8934f] hover:to-[#c4a056] transition-all"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Importar Extrato CSV"
      >
        <form onSubmit={handleImportCSV} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-2">Formato do CSV:</p>
            <code className="block bg-white p-2 rounded text-xs">
              Data,Descrição,Valor,Tipo<br/>
              2025-01-15,Pagamento Cliente,1500.00,credit<br/>
              2025-01-16,Fornecedor X,-850.50,debit
            </code>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conta Bancária</label>
            <select
              value={importData.bank_account_id}
              onChange={(e) => setImportData({ ...importData, bank_account_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              required
            >
              <option value="">Selecione uma conta</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.bank_name} - {account.account_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dados CSV</label>
            <textarea
              value={importData.csv_data}
              onChange={(e) => setImportData({ ...importData, csv_data: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent font-mono text-sm"
              rows={8}
              placeholder="Cole aqui o conteúdo do arquivo CSV"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowImportModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white rounded-lg hover:from-[#b8934f] hover:to-[#c4a056] transition-all"
            >
              Importar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
