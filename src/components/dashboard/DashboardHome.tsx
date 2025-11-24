import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useCustomer } from '../../contexts/CustomerContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Package,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  totalCustomers: number;
  totalInvoices: number;
  pendingInvoices: number;
  totalProducts: number;
}

export function DashboardHome() {
  const { selectedCustomer } = useCustomer();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [selectedCustomer]);

  const loadStats = async () => {
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

      let invoicesQuery = supabase.from('invoices').select('total, status').eq('company_id', companies.id);
      let expensesQuery = supabase.from('expenses').select('amount').eq('company_id', companies.id);
      let receivablesQuery = supabase.from('accounts_receivable').select('amount, status').eq('company_id', companies.id);
      let payablesQuery = supabase.from('accounts_payable').select('amount, status').eq('company_id', companies.id);

      if (selectedCustomer) {
        invoicesQuery = invoicesQuery.eq('customer_id', selectedCustomer.id);
        receivablesQuery = receivablesQuery.eq('customer_id', selectedCustomer.id);
        payablesQuery = payablesQuery.eq('customer_id', selectedCustomer.id);
      }

      const [invoicesData, expensesData, customersData, productsData, receivablesData, payablesData] = await Promise.all([
        invoicesQuery,
        expensesQuery,
        supabase.from('customers').select('id').eq('company_id', companies.id),
        supabase.from('products').select('id').eq('company_id', companies.id),
        receivablesQuery,
        payablesQuery,
      ]);

      const invoiceRevenue = invoicesData.data?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      const receivableRevenue = receivablesData.data?.filter(r => r.status === 'received').reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      const totalRevenue = invoiceRevenue + receivableRevenue;

      const expensesTotal = expensesData.data?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const payablesTotal = payablesData.data?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const totalExpenses = expensesTotal + payablesTotal;

      const pendingInvoices = invoicesData.data?.filter(inv => inv.status !== 'paid').length || 0;

      setStats({
        totalRevenue,
        totalExpenses,
        totalCustomers: customersData.data?.length || 0,
        totalInvoices: invoicesData.data?.length || 0,
        pendingInvoices,
        totalProducts: productsData.data?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const netProfit = stats.totalRevenue - stats.totalExpenses;

  const statCards = [
    {
      title: 'Receita Total',
      value: stats.totalRevenue,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Despesas Totais',
      value: stats.totalExpenses,
      icon: TrendingDown,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: 'Lucro Líquido',
      value: netProfit,
      icon: DollarSign,
      color: 'from-[#c8a35f] to-[#d4b066]',
      bgColor: 'bg-amber-50',
      iconColor: 'text-[#c8a35f]',
    },
    {
      title: 'Clientes',
      value: stats.totalCustomers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      isCount: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#c8a35f] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={card.iconColor} size={24} />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <ArrowUp size={16} />
                  <span>+12%</span>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900">
                {card.isCount
                  ? card.value
                  : new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(card.value)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notas Fiscais</h3>
              <p className="text-sm text-gray-600">Total de faturas</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pendentes</span>
              <span className="text-lg font-semibold text-orange-600">{stats.pendingInvoices}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <Package className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Produtos</h3>
              <p className="text-sm text-gray-600">Itens no estoque</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">{stats.totalProducts}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0a3d2c] to-[#0d4d38] rounded-xl shadow-md p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Fluxo de Caixa</h3>
          <p className="text-sm text-white/80 mb-4">Visão geral do mês</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUp className="text-green-400" size={18} />
                <span className="text-sm">Entradas</span>
              </div>
              <span className="font-semibold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(stats.totalRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDown className="text-red-400" size={18} />
                <span className="text-sm">Saídas</span>
              </div>
              <span className="font-semibold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(stats.totalExpenses)}
              </span>
            </div>
            <div className="border-t border-white/20 pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Saldo</span>
                <span className="text-xl font-bold text-[#c8a35f]">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
