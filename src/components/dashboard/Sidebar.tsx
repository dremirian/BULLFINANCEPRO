import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Package,
  BarChart3,
  LogOut,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  ChevronDown,
  ChevronRight,
  PieChart,
  Building2,
  ArrowLeftRight,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: any;
  items?: MenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
}

const menuGroups: MenuGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'banking',
    label: 'Bancário',
    icon: Building2,
    items: [
      { id: 'bank-accounts', label: 'Contas Bancárias', icon: Building2 },
      { id: 'bank-movements', label: 'Movimentações', icon: ArrowLeftRight },
    ],
  },
  {
    id: 'financial',
    label: 'Financeiro',
    icon: TrendingUp,
    items: [
      { id: 'accounts-receivable', label: 'Contas a Receber', icon: ArrowUpCircle },
      { id: 'accounts-payable', label: 'Contas a Pagar', icon: ArrowDownCircle },
      { id: 'cash-flow', label: 'Fluxo de Caixa', icon: Activity },
      { id: 'expenses', label: 'Despesas', icon: TrendingDown },
    ],
  },
  {
    id: 'sales',
    label: 'Vendas',
    icon: FileText,
    items: [
      { id: 'invoices', label: 'Notas Fiscais', icon: FileText },
      { id: 'customers', label: 'Clientes', icon: Users },
    ],
  },
  {
    id: 'inventory',
    label: 'Estoque',
    icon: Package,
    items: [
      { id: 'products', label: 'Produtos', icon: Package },
      { id: 'suppliers', label: 'Fornecedores', icon: ShoppingCart },
    ],
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: BarChart3,
    items: [
      { id: 'reports', label: 'Relatórios Gerenciais', icon: BarChart3 },
      { id: 'dre', label: 'DRE', icon: PieChart },
    ],
  },
];

export function Sidebar({ activeSection, onSectionChange, onLogout }: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['banking', 'financial', 'sales', 'inventory', 'reports']);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const isGroupActive = (group: MenuGroup) => {
    if (group.id === activeSection) return true;
    return group.items?.some((item) => item.id === activeSection);
  };

  return (
    <div className="w-64 bg-[#0a3d2c] text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-[#c8a35f]/20">
        <div className="flex items-center gap-3">
          <img
            src="/bullfinance-removebg-preview.png"
            alt="Bull Finance"
            className="h-10 w-10 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-[#c8a35f]">BULL FINANCE</h1>
            <p className="text-xs text-gray-400">Gestão Financeira</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        {menuGroups.map((group) => {
          const Icon = group.icon;
          const isExpanded = expandedGroups.includes(group.id);
          const isActive = isGroupActive(group);

          if (!group.items) {
            return (
              <button
                key={group.id}
                onClick={() => onSectionChange(group.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
                  activeSection === group.id
                    ? 'bg-[#c8a35f] text-white shadow-lg'
                    : 'hover:bg-white/10 text-gray-300'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{group.label}</span>
              </button>
            );
          }

          return (
            <div key={group.id} className="mb-2">
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  isActive ? 'bg-white/10' : 'hover:bg-white/5'
                } text-gray-300`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="font-medium">{group.label}</span>
                </div>
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {isExpanded && (
                <div className="mt-1 ml-4 border-l-2 border-[#c8a35f]/30 pl-2">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSectionChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all mb-1 text-sm ${
                          activeSection === item.id
                            ? 'bg-[#c8a35f] text-white font-medium shadow-lg'
                            : 'hover:bg-white/10 text-gray-400'
                        }`}
                      >
                        <ItemIcon size={18} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#c8a35f]/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 transition-all text-gray-300 hover:text-red-400"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}
