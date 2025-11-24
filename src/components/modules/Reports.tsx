import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCustomer } from '../../contexts/CustomerContext';
import { generatePDF, formatCurrency, formatDate } from '../../lib/pdfExport';

interface ReportData {
  monthlyRevenue: { month: string; value: number }[];
  monthlyExpenses: { month: string; value: number }[];
  topCustomers: { name: string; total: number }[];
  categoryExpenses: { category: string; total: number }[];
}

export function Reports() {
  const { selectedCustomer } = useCustomer();
  const [reportData, setReportData] = useState<ReportData>({
    monthlyRevenue: [],
    monthlyExpenses: [],
    topCustomers: [],
    categoryExpenses: [],
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadReports();
  }, [period, selectedCustomer]);

  const loadReports = async () => {
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
      const now = new Date();
      const monthsToShow = period === 'month' ? 6 : period === 'quarter' ? 3 : 12;

      let receivablesQuery = supabase.from('accounts_receivable').select('amount, payment_date, status').eq('company_id', companyId);
      let payablesQuery = supabase.from('accounts_payable').select('amount, payment_date, status').eq('company_id', companyId);
      let invoicesQuery = supabase.from('invoices').select('total, issue_date').eq('company_id', companyId);

      if (selectedCustomer) {
        receivablesQuery = receivablesQuery.eq('customer_id', selectedCustomer.id);
        payablesQuery = payablesQuery.eq('customer_id', selectedCustomer.id);
        invoicesQuery = invoicesQuery.eq('customer_id', selectedCustomer.id);
      }

      const [receivablesData, payablesData, expensesData, invoicesData, customersData] =
        await Promise.all([
          receivablesQuery,
          payablesQuery,
          supabase
            .from('expenses')
            .select('amount, expense_date, category')
            .eq('company_id', companyId),
          invoicesQuery,
          supabase
            .from('customers')
            .select(`
              id,
              name,
              accounts_receivable(amount, status)
            `)
            .eq('company_id', companyId),
        ]);

      const monthlyRevenue: { month: string; value: number }[] = [];
      const monthlyExpenses: { month: string; value: number }[] = [];

      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        const month = date.getMonth();
        const year = date.getFullYear();

        const receivables = receivablesData.data || [];
        const payables = payablesData.data || [];
        const expenses = expensesData.data || [];
        const invoices = invoicesData.data || [];

        const monthRevenue =
          receivables
            .filter((r) => {
              if (r.status !== 'received' || !r.payment_date) return false;
              const paymentDate = new Date(r.payment_date);
              return paymentDate.getMonth() === month && paymentDate.getFullYear() === year;
            })
            .reduce((sum, r) => sum + Number(r.amount), 0) +
          invoices
            .filter((i) => {
              const issueDate = new Date(i.issue_date);
              return issueDate.getMonth() === month && issueDate.getFullYear() === year;
            })
            .reduce((sum, i) => sum + Number(i.total), 0);

        const monthExpenses =
          payables
            .filter((p) => {
              if (p.status !== 'paid' || !p.payment_date) return false;
              const paymentDate = new Date(p.payment_date);
              return paymentDate.getMonth() === month && paymentDate.getFullYear() === year;
            })
            .reduce((sum, p) => sum + Number(p.amount), 0) +
          expenses
            .filter((e) => {
              const expenseDate = new Date(e.expense_date);
              return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
            })
            .reduce((sum, e) => sum + Number(e.amount), 0);

        monthlyRevenue.push({ month: monthName, value: monthRevenue });
        monthlyExpenses.push({ month: monthName, value: monthExpenses });
      }

      const topCustomers = (customersData.data || [])
        .map((customer: any) => ({
          name: customer.name,
          total: (customer.accounts_receivable || [])
            .filter((ar: any) => ar.status === 'received')
            .reduce((sum: number, ar: any) => sum + Number(ar.amount), 0),
        }))
        .filter((c) => c.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const categoryMap = new Map<string, number>();
      (expensesData.data || []).forEach((expense) => {
        const category = expense.category || 'Outros';
        categoryMap.set(category, (categoryMap.get(category) || 0) + Number(expense.amount));
      });

      const categoryExpenses = Array.from(categoryMap.entries())
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setReportData({
        monthlyRevenue,
        monthlyExpenses,
        topCustomers,
        categoryExpenses,
      });
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const data = reportData.monthlyRevenue.map((item, index) => ({
      month: item.month,
      revenue: formatCurrency(item.value),
      expenses: formatCurrency(reportData.monthlyExpenses[index]?.value || 0),
      profit: formatCurrency(item.value - (reportData.monthlyExpenses[index]?.value || 0)),
    }));

    const totalRevenue = reportData.monthlyRevenue.reduce((sum, item) => sum + item.value, 0);
    const totalExpenses = reportData.monthlyExpenses.reduce((sum, item) => sum + item.value, 0);
    const profit = totalRevenue - totalExpenses;

    generatePDF({
      title: 'Relatório Financeiro',
      subtitle: `Análise detalhada do período selecionado`,
      columns: [
        { header: 'Mês', dataKey: 'month' },
        { header: 'Receitas', dataKey: 'revenue' },
        { header: 'Despesas', dataKey: 'expenses' },
        { header: 'Lucro', dataKey: 'profit' },
      ],
      data,
      fileName: `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`,
      summary: [
        { label: 'Receita Total', value: formatCurrency(totalRevenue) },
        { label: 'Despesas Totais', value: formatCurrency(totalExpenses) },
        { label: 'Lucro Líquido', value: formatCurrency(profit) },
        { label: 'Margem de Lucro', value: `${((profit / totalRevenue) * 100).toFixed(1)}%` },
      ],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#c8a35f] border-t-transparent"></div>
      </div>
    );
  }

  const totalRevenue = reportData.monthlyRevenue.reduce((sum, item) => sum + item.value, 0);
  const totalExpenses = reportData.monthlyExpenses.reduce((sum, item) => sum + item.value, 0);
  const profit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
          <p className="text-gray-600 mt-1">Análise completa do seu negócio</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="bg-white border-2 border-[#c8a35f] text-[#c8a35f] px-6 py-2 rounded-lg hover:bg-[#c8a35f] hover:text-white transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <Download size={20} />
            Exportar PDF
          </button>
          <div className="flex gap-2">
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
            <button
              onClick={() => setPeriod('year')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'year'
                  ? 'bg-[#c8a35f] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Ano
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-red-50">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Despesas Totais</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[#c8a35f]/10">
              <DollarSign className="text-[#c8a35f]" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Lucro Líquido</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(profit)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-blue-50">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Receitas vs Despesas</h3>
              <p className="text-sm text-gray-600">Últimos {reportData.monthlyRevenue.length} meses</p>
            </div>
          </div>
          <div className="space-y-4">
            {reportData.monthlyRevenue.map((item, index) => {
              const expense = reportData.monthlyExpenses[index]?.value || 0;
              const maxValue = Math.max(...reportData.monthlyRevenue.map((r) => r.value));
              const revenueWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
              const expenseWidth = maxValue > 0 ? (expense / maxValue) * 100 : 0;

              return (
                <div key={item.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{item.month}</span>
                    <span className="text-gray-600">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${revenueWidth}%` }}
                      ></div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${expenseWidth}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Receitas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Despesas</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-purple-50">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Resumo do Período</h3>
              <p className="text-sm text-gray-600">Principais métricas</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Margem de Lucro</p>
                <p className="text-2xl font-bold text-green-700">
                  {totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Média Mensal</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(totalRevenue / reportData.monthlyRevenue.length)}
                </p>
              </div>
              <DollarSign className="text-blue-600" size={32} />
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Custo Operacional</p>
                <p className="text-2xl font-bold text-orange-700">
                  {totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </p>
              </div>
              <TrendingDown className="text-orange-600" size={32} />
            </div>
          </div>
        </div>
      </div>

      {reportData.topCustomers.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Clientes</h3>
          <div className="space-y-3">
            {reportData.topCustomers.map((customer, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{customer.name}</span>
                <span className="text-[#c8a35f] font-bold">{formatCurrency(customer.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
