import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function CashFlow() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [cashFlowData, setCashFlowData] = useState({
    currentBalance: 85750.00,
    projectedBalance: 125300.00,
    totalInflow: 145000.00,
    totalOutflow: 89500.00,
    dailyData: [
      { date: '01/06', inflow: 12000, outflow: 8000, balance: 89750 },
      { date: '05/06', inflow: 15000, outflow: 9500, balance: 95250 },
      { date: '10/06', inflow: 18000, outflow: 11000, balance: 102250 },
      { date: '15/06', inflow: 22000, outflow: 13000, balance: 111250 },
      { date: '20/06', inflow: 19000, outflow: 10000, balance: 120250 },
      { date: '25/06', inflow: 25000, outflow: 15000, balance: 130250 },
      { date: '30/06', inflow: 28000, outflow: 17000, balance: 141250 },
    ],
  });

  useEffect(() => {
    loadCashFlow();
  }, [period]);

  const loadCashFlow = async () => {
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

      const companyId = companies.id;

      const [receivablesData, payablesData, bankAccountsData] = await Promise.all([
        supabase
          .from('accounts_receivable')
          .select('amount, due_date, payment_date, status')
          .eq('company_id', companyId),
        supabase
          .from('accounts_payable')
          .select('amount, due_date, payment_date, status')
          .eq('company_id', companyId),
        supabase
          .from('bank_accounts')
          .select('balance')
          .eq('company_id', companyId),
      ]);

      const receivables = receivablesData.data || [];
      const payables = payablesData.data || [];
      const bankAccounts = bankAccountsData.data || [];

      const totalReceivable = receivables
        .filter((r) => r.status === 'pending' || r.status === 'overdue')
        .reduce((sum, r) => sum + Number(r.amount), 0);

      const totalReceived = receivables
        .filter((r) => r.status === 'received')
        .reduce((sum, r) => sum + Number(r.amount), 0);

      const totalPayable = payables
        .filter((p) => p.status === 'pending' || p.status === 'overdue')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalPaid = payables
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const currentBalance = bankAccounts.reduce((sum, b) => sum + Number(b.balance), 0);
      const projectedBalance = currentBalance + totalReceivable - totalPayable;

      const today = new Date();
      const dailyData = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i * 5);

        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

        const inflowForDate = receivables
          .filter((r) => {
            const dueDate = new Date(r.due_date);
            return dueDate <= date && (r.status === 'pending' || r.status === 'received');
          })
          .reduce((sum, r) => sum + Number(r.amount), 0);

        const outflowForDate = payables
          .filter((p) => {
            const dueDate = new Date(p.due_date);
            return dueDate <= date && (p.status === 'pending' || p.status === 'paid');
          })
          .reduce((sum, p) => sum + Number(p.amount), 0);

        const balanceForDate = currentBalance + inflowForDate - outflowForDate;

        dailyData.push({
          date: dateStr,
          inflow: Math.round(inflowForDate / (i + 1)),
          outflow: Math.round(outflowForDate / (i + 1)),
          balance: balanceForDate,
        });
      }

      setCashFlowData({
        currentBalance,
        projectedBalance,
        totalInflow: totalReceivable + totalReceived,
        totalOutflow: totalPayable + totalPaid,
        dailyData,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading cash flow:', error);
      setLoading(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Fluxo de Caixa</h2>
          <p className="text-gray-600 mt-1">Visão completa das entradas e saídas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'week'
                ? 'bg-[#c8a35f] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'month'
                ? 'bg-[#c8a35f] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'quarter'
                ? 'bg-[#c8a35f] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Trimestre
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-100">Saldo Atual</p>
            <DollarSign size={24} />
          </div>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(cashFlowData.currentBalance)}
          </p>
          <p className="text-xs text-blue-100 mt-1">Atualizado agora</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-100">Entradas</p>
            <ArrowUp size={24} />
          </div>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(cashFlowData.totalInflow)}
          </p>
          <p className="text-xs text-green-100 mt-1">No período</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-100">Saídas</p>
            <ArrowDown size={24} />
          </div>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(cashFlowData.totalOutflow)}
          </p>
          <p className="text-xs text-red-100 mt-1">No período</p>
        </div>

        <div className="bg-gradient-to-br from-[#c8a35f] to-[#d4b066] p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-100">Saldo Projetado</p>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(cashFlowData.projectedBalance)}
          </p>
          <p className="text-xs text-amber-100 mt-1">Fim do período</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-[#c8a35f]" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Projeção de Fluxo de Caixa</h3>
            <p className="text-sm text-gray-600">Entradas vs Saídas no período</p>
          </div>
        </div>

        <div className="space-y-4">
          {cashFlowData.dailyData.map((item, index) => {
            const maxValue = Math.max(...cashFlowData.dailyData.map((d) => Math.max(d.inflow, d.outflow)));
            const inflowWidth = (item.inflow / maxValue) * 100;
            const outflowWidth = (item.outflow / maxValue) * 100;
            const net = item.inflow - item.outflow;

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-green-600">
                      +{new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                      }).format(item.inflow)}
                    </span>
                    <span className="text-red-600">
                      -{new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                      }).format(item.outflow)}
                    </span>
                    <span className={`font-semibold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                      }).format(item.balance)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${inflowWidth}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-red-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${outflowWidth}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-6 mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Entradas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Saídas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
