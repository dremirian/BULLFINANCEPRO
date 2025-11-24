import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/dashboard/Sidebar';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { Invoices } from './components/modules/Invoices';
import { Expenses } from './components/modules/Expenses';
import { Customers } from './components/modules/Customers';
import { Products } from './components/modules/Products';
import { Reports } from './components/modules/Reports';
import { AccountsReceivable } from './components/modules/AccountsReceivable';
import { AccountsPayable } from './components/modules/AccountsPayable';
import { CashFlow } from './components/modules/CashFlow';
import { AlertsDashboard } from './components/modules/AlertsDashboard';
import { DREDashboard } from './components/modules/DREDashboard';
import { Suppliers } from './components/modules/Suppliers';
import { BankAccounts } from './components/modules/BankAccounts';
import { BankMovements } from './components/modules/BankMovements';

function DashboardContent() {
  const { user, loading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c8a35f] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const getSectionTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      'bank-accounts': 'Contas Bancárias',
      'bank-movements': 'Movimentações Bancárias',
      'accounts-receivable': 'Contas a Receber',
      'accounts-payable': 'Contas a Pagar',
      'cash-flow': 'Fluxo de Caixa',
      invoices: 'Notas Fiscais',
      expenses: 'Despesas',
      customers: 'Clientes',
      suppliers: 'Fornecedores',
      products: 'Produtos',
      transactions: 'Transações',
      dre: 'DRE',
      reports: 'Relatórios',
      alerts: 'Alertas',
      settings: 'Configurações',
    };
    return titles[activeSection] || 'Dashboard';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'bank-accounts':
        return <BankAccounts />;
      case 'bank-movements':
        return <BankMovements />;
      case 'accounts-receivable':
        return <AccountsReceivable />;
      case 'accounts-payable':
        return <AccountsPayable />;
      case 'cash-flow':
        return <CashFlow />;
      case 'invoices':
        return <Invoices />;
      case 'expenses':
        return <Expenses />;
      case 'customers':
        return <Customers />;
      case 'products':
        return <Products />;
      case 'dre':
        return <DREDashboard />;
      case 'reports':
        return <Reports />;
      case 'alerts':
        return <AlertsDashboard />;
      case 'suppliers':
        return <Suppliers />;
      case 'transactions':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Transações</h2>
            <p className="text-gray-600 mt-2">Em desenvolvimento</p>
          </div>
        );
      case 'bank-accounts':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Contas Bancárias</h2>
            <p className="text-gray-600 mt-2">Em desenvolvimento</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
            <p className="text-gray-600 mt-2">Em desenvolvimento</p>
          </div>
        );
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={signOut}
      />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <DashboardHeader title={getSectionTitle()} userEmail={user.email} />
        <main className="flex-1 p-8">{renderContent()}</main>
        <footer className="bg-white border-t border-gray-200 py-6 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-600">
                  © 2025 Bull Finance. Todos os direitos reservados.
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-600">
                  Idealizado por{' '}
                  <a
                    href="https://www.linkedin.com/in/vanessaazuos/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c8a35f] hover:text-[#b8934f] font-semibold transition-colors"
                  >
                    Vanessa Dias
                  </a>
                  {' | '}
                  Desenvolvido por{' '}
                  <a
                    href="https://www.linkedin.com/in/andressamirian/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c8a35f] hover:text-[#b8934f] font-semibold transition-colors"
                  >
                    Andressa Mirian
                  </a>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CustomerProvider>
        <DashboardContent />
      </CustomerProvider>
    </AuthProvider>
  );
}

export default App;
