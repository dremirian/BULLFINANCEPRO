import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCustomer } from '../../contexts/CustomerContext';

interface DREData {
  grossRevenue: number;
  deductions: number;
  netRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: {
    administrative: number;
    sales: number;
    financial: number;
    total: number;
  };
  operatingProfit: number;
  otherIncome: number;
  otherExpenses: number;
  profitBeforeTax: number;
  taxes: number;
  netProfit: number;
}

export function DREDashboard() {
  const { selectedCustomer } = useCustomer();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [dreData, setDreData] = useState<DREData>({
    grossRevenue: 0,
    deductions: 0,
    netRevenue: 0,
    costOfGoodsSold: 0,
    grossProfit: 0,
    operatingExpenses: {
      administrative: 0,
      sales: 0,
      financial: 0,
      total: 0,
    },
    operatingProfit: 0,
    otherIncome: 0,
    otherExpenses: 0,
    profitBeforeTax: 0,
    taxes: 0,
    netProfit: 0,
  });

  useEffect(() => {
    loadDREData();
  }, [period, selectedCustomer]);

  const loadDREData = async () => {
    try {
      setLoading(true);
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
      let startDate: Date;

      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      let invoicesQuery = supabase
        .from('invoices')
        .select('total, tax_amount, discount')
        .eq('company_id', companyId)
        .gte('issue_date', startDate.toISOString());

      let receivablesQuery = supabase
        .from('accounts_receivable')
        .select('amount, status')
        .eq('company_id', companyId)
        .gte('due_date', startDate.toISOString());

      let expensesQuery = supabase
        .from('expenses')
        .select('amount, category')
        .eq('company_id', companyId)
        .gte('expense_date', startDate.toISOString());

      let payablesQuery = supabase
        .from('accounts_payable')
        .select('amount, status')
        .eq('company_id', companyId)
        .gte('due_date', startDate.toISOString());

      if (selectedCustomer) {
        invoicesQuery = invoicesQuery.eq('customer_id', selectedCustomer.id);
        receivablesQuery = receivablesQuery.eq('customer_id', selectedCustomer.id);
        payablesQuery = payablesQuery.eq('customer_id', selectedCustomer.id);
      }

      const [invoicesData, receivablesData, expensesData, payablesData] = await Promise.all([
        invoicesQuery,
        receivablesQuery,
        expensesQuery,
        payablesQuery,
      ]);

      const invoices = invoicesData.data || [];
      const receivables = receivablesData.data || [];
      const expenses = expensesData.data || [];
      const payables = payablesData.data || [];

      const invoiceRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
      const receivableRevenue = receivables
        .filter((r) => r.status === 'received')
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);
      const grossRevenue = invoiceRevenue + receivableRevenue;

      const taxAmount = invoices.reduce((sum, inv) => sum + Number(inv.tax_amount || 0), 0);
      const discounts = invoices.reduce((sum, inv) => sum + Number(inv.discount || 0), 0);
      const deductions = taxAmount + discounts;

      const netRevenue = grossRevenue - deductions;

      const costOfGoodsSold = expenses
        .filter((e) => e.category === 'Custo de Produtos' || e.category === 'CMV')
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const grossProfit = netRevenue - costOfGoodsSold;

      const administrative = expenses
        .filter((e) => e.category === 'Administrativo' || e.category === 'Salários')
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const sales = expenses
        .filter((e) => e.category === 'Marketing' || e.category === 'Vendas')
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const financial = expenses
        .filter((e) => e.category === 'Financeiro' || e.category === 'Juros')
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const otherExpensesTotal = expenses
        .filter(
          (e) =>
            !['Custo de Produtos', 'CMV', 'Administrativo', 'Salários', 'Marketing', 'Vendas', 'Financeiro', 'Juros'].includes(
              e.category || ''
            )
        )
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const operatingExpensesTotal = administrative + sales + financial;

      const operatingProfit = grossProfit - operatingExpensesTotal;

      const otherIncome = 0;
      const otherExpenses = otherExpensesTotal;

      const profitBeforeTax = operatingProfit + otherIncome - otherExpenses;

      const taxes = profitBeforeTax > 0 ? profitBeforeTax * 0.30 : 0;

      const netProfit = profitBeforeTax - taxes;

      setDreData({
        grossRevenue,
        deductions,
        netRevenue,
        costOfGoodsSold,
        grossProfit,
        operatingExpenses: {
          administrative,
          sales,
          financial,
          total: operatingExpensesTotal,
        },
        operatingProfit,
        otherIncome,
        otherExpenses,
        profitBeforeTax,
        taxes,
        netProfit,
      });
    } catch (error) {
      console.error('Error loading DRE data:', error);
    } finally {
      setLoading(false);
    }
  };

  const margins = {
    grossMargin: dreData.netRevenue > 0 ? (dreData.grossProfit / dreData.netRevenue) * 100 : 0,
    operatingMargin: dreData.netRevenue > 0 ? (dreData.operatingProfit / dreData.netRevenue) * 100 : 0,
    netMargin: dreData.netRevenue > 0 ? (dreData.netProfit / dreData.netRevenue) * 100 : 0,
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
          <h2 className="text-2xl font-bold text-gray-900">DRE - Demonstração do Resultado</h2>
          <p className="text-gray-600 mt-1">
            Análise completa de receitas e despesas
            {selectedCustomer && (
              <span className="text-[#c8a35f] font-semibold"> - {selectedCustomer.name}</span>
            )}
          </p>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-100">Receita Líquida</p>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(dreData.netRevenue)}
          </p>
          <p className="text-xs text-green-100 mt-1">100% da receita</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-100">Lucro Operacional</p>
            <DollarSign size={24} />
          </div>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(dreData.operatingProfit)}
          </p>
          <p className="text-xs text-blue-100 mt-1">
            Margem: {margins.operatingMargin.toFixed(1)}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#c8a35f] to-[#d4b066] p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-100">Lucro Líquido</p>
            <BarChart3 size={24} />
          </div>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(dreData.netProfit)}
          </p>
          <p className="text-xs text-amber-100 mt-1">
            Margem: {margins.netMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="text-[#c8a35f]" size={24} />
            Estrutura DRE
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="font-semibold text-gray-900">Receita Bruta</span>
              <span className="font-semibold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(dreData.grossRevenue)}
              </span>
            </div>

            <div className="flex justify-between py-2 pl-4">
              <span className="text-gray-600">(-) Deduções</span>
              <span className="text-red-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(dreData.deductions)}
              </span>
            </div>

            <div className="flex justify-between py-3 border-y border-gray-200 bg-blue-50">
              <span className="font-semibold text-gray-900">Receita Líquida</span>
              <span className="font-semibold text-blue-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(dreData.netRevenue)}
              </span>
            </div>

            <div className="flex justify-between py-2 pl-4">
              <span className="text-gray-600">(-) CMV</span>
              <span className="text-red-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(dreData.costOfGoodsSold)}
              </span>
            </div>

            <div className="flex justify-between py-3 border-y border-gray-200 bg-green-50">
              <span className="font-semibold text-gray-900">Lucro Bruto</span>
              <span className="font-semibold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(dreData.grossProfit)}
              </span>
            </div>

            <div className="flex justify-between py-2 pl-4">
              <span className="text-gray-600">(-) Despesas Operacionais</span>
              <span className="text-red-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(dreData.operatingExpenses.total)}
              </span>
            </div>

            <div className="flex justify-between py-3 border-y border-gray-200 bg-yellow-50">
              <span className="font-semibold text-gray-900">Lucro Operacional</span>
              <span className="font-semibold text-yellow-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(dreData.operatingProfit)}
              </span>
            </div>

            <div className="flex justify-between py-2 pl-4">
              <span className="text-gray-600">(-) Impostos (30%)</span>
              <span className="text-red-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(dreData.taxes)}
              </span>
            </div>

            <div className="flex justify-between py-4 border-t-2 border-gray-300 bg-gradient-to-r from-[#c8a35f]/10 to-[#d4b066]/10">
              <span className="font-bold text-gray-900 text-lg">Lucro Líquido</span>
              <span className="font-bold text-[#c8a35f] text-lg">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(dreData.netProfit)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Percent className="text-[#c8a35f]" size={24} />
              Margens de Lucro
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Margem Bruta</span>
                  <span className="text-sm font-bold text-green-600">
                    {margins.grossMargin.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(margins.grossMargin, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Margem Operacional</span>
                  <span className="text-sm font-bold text-blue-600">
                    {margins.operatingMargin.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(Math.max(margins.operatingMargin, 0), 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Margem Líquida</span>
                  <span className="text-sm font-bold text-[#c8a35f]">
                    {margins.netMargin.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-[#c8a35f] h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(Math.max(margins.netMargin, 0), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Despesas Operacionais</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Administrativas</span>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(dreData.operatingExpenses.administrative)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Comerciais</span>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(dreData.operatingExpenses.sales)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Financeiras</span>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(dreData.operatingExpenses.financial)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
