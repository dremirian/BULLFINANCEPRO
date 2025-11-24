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
    <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0a3d2c]">{title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Bem-vindo ao seu painel de controle
            </p>
          </div>

          <div className="border-l border-gray-300 pl-6">
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
              className="w-64 px-4 py-2 bg-white border-2 border-[#c8a35f] text-gray-800 font-medium rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-[#c8a35f] outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none w-64"
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
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      {customer.email && (
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    Nenhum cliente encontrado
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={22} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
            <div className="w-10 h-10 bg-gradient-to-br from-[#c8a35f] to-[#d4b066] rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-800">Usuário</p>
              <p className="text-gray-600">{userEmail || 'user@email.com'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
