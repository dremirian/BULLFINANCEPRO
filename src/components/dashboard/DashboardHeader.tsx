import { useState } from 'react';
import { Bell, Search, User, Users } from 'lucide-react';
import { useCustomer } from '../../contexts/CustomerContext';

interface DashboardHeaderProps {
  title: string;
  userEmail?: string;
}

export function DashboardHeader({ title, userEmail }: DashboardHeaderProps) {
  const { selectedCustomer, setSelectedCustomer, customers, loading } = useCustomer();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const selectCustomerFromSearch = (customer: any) => {
    setSelectedCustomer(customer);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 sticky top-0 z-10 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex-1 sm:flex-none">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0a3d2c]">{title}</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
              Bem-vindo ao seu painel de controle
            </p>
          </div>

          <div className="w-full sm:w-auto sm:border-l sm:border-gray-300 sm:pl-4 lg:pl-6">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-[#c8a35f]" />
              <label className="text-xs font-medium text-gray-600 uppercase">
                Cliente Selecionado
              </label>
            </div>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const customer = customers.find((c) => c.id === e.target.value);
                setSelectedCustomer(customer || null);
              }}
              disabled={loading}
              className="w-full sm:w-48 lg:w-64 px-3 sm:px-4 py-2 bg-white border-2 border-[#c8a35f] text-gray-800 font-medium rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-[#c8a35f] outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
              style={{ color: '#374151' }}
            >
              <option value="" style={{ color: '#374151' }}>Todos os Clientes</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id} style={{ color: '#374151' }}>
                  {customer.name}
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <p className="text-xs text-gray-500 mt-1">
                Mostrando dados de: <span className="font-semibold text-[#c8a35f]">{selectedCustomer.name}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none w-full lg:w-64 text-sm"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            {showSearchResults && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => selectCustomerFromSearch(customer)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium text-gray-900 text-sm">{customer.name}</div>
                      {customer.email && (
                        <div className="text-xs text-gray-500">{customer.email}</div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-center text-sm">
                    Nenhum cliente encontrado
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative flex-shrink-0">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="hidden sm:flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-300">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-[#c8a35f] to-[#d4b066] rounded-full flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-white lg:w-5 lg:h-5" />
            </div>
            <div className="text-xs lg:text-sm hidden md:block">
              <p className="font-medium text-gray-800">Usuário</p>
              <p className="text-gray-600 truncate max-w-[120px]">{userEmail || 'user@email.com'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
