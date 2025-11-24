import { useState, useEffect } from 'react';
import { Plus, Users, Mail, Phone, Edit, Trash2, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Customer } from '../../types/database';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { generatePDF, formatDate } from '../../lib/pdfExport';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    cpf_cnpj: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    notes: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
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

      setCompanyId(companies.id);

      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', companies.id)
        .order('created_at', { ascending: false });

      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      company_id: companyId,
      name: formData.name,
      cpf_cnpj: formData.cpf_cnpj,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      postal_code: formData.postal_code || null,
      notes: formData.notes || null,
    };

    try {
      if (editingItem) {
        await supabase.from('customers').update(data).eq('id', editingItem.id);
      } else {
        await supabase.from('customers').insert([data]);
      }

      await loadCustomers();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Erro ao salvar cliente');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await supabase.from('customers').delete().eq('id', deletingId);
      await loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Erro ao excluir cliente');
    }
  };

  const handleEdit = (item: Customer) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      cpf_cnpj: item.cpf_cnpj,
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || '',
      city: item.city || '',
      state: item.state || '',
      postal_code: item.postal_code || '',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      cpf_cnpj: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      notes: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#c8a35f] border-t-transparent"></div>
      </div>
    );
  }

  const handleExportPDF = () => {
    const data = customers.map((customer) => ({
      name: customer.name,
      cpf_cnpj: customer.cpf_cnpj,
      email: customer.email || '-',
      phone: customer.phone || '-',
      city: customer.city || '-',
      created: formatDate(customer.created_at),
    }));

    generatePDF({
      title: 'Relatório de Clientes',
      subtitle: `Total de ${customers.length} clientes cadastrados`,
      columns: [
        { header: 'Nome', dataKey: 'name' },
        { header: 'CPF/CNPJ', dataKey: 'cpf_cnpj' },
        { header: 'Email', dataKey: 'email' },
        { header: 'Telefone', dataKey: 'phone' },
        { header: 'Cidade', dataKey: 'city' },
        { header: 'Cadastro', dataKey: 'created' },
      ],
      data,
      fileName: `clientes_${new Date().toISOString().split('T')[0]}.pdf`,
      summary: [
        { label: 'Total de Clientes', value: customers.length.toString() },
        {
          label: 'Novos Este Mês',
          value: customers
            .filter((c) => {
              const createdDate = new Date(c.created_at);
              const now = new Date();
              return (
                createdDate.getMonth() === now.getMonth() &&
                createdDate.getFullYear() === now.getFullYear()
              );
            })
            .length.toString(),
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-600 mt-1">Gerencie seus clientes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="bg-white border-2 border-[#c8a35f] text-[#c8a35f] px-6 py-3 rounded-lg hover:bg-[#c8a35f] hover:text-white transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <Download size={20} />
            Exportar PDF
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white px-6 py-3 rounded-lg hover:from-[#b8934f] hover:to-[#c4a056] transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <Plus size={20} />
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Total de Clientes</p>
          <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Ativos</p>
          <p className="text-2xl font-bold text-green-600">{customers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 mb-1">Novos Este Mês</p>
          <p className="text-2xl font-bold text-purple-600">
            {customers.filter((c) => {
              const date = new Date(c.created_at);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">CPF/CNPJ</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Telefone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Cidade</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500">Nenhum cliente cadastrado</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#c8a35f] to-[#d4b066] rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{customer.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-gray-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700">{customer.cpf_cnpj}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-gray-700">{customer.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-700">{customer.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700">{customer.city || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(customer.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-600" />
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
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CPF/CNPJ *</label>
            <input
              type="text"
              required
              value={formData.cpf_cnpj}
              onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white rounded-lg hover:from-[#b8934f] hover:to-[#c4a056] transition-colors font-medium"
            >
              {editingItem ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
