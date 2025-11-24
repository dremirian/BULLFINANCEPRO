import { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, DollarSign, User, Edit, Trash2, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Invoice, Customer } from '../../types/database';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface InvoiceFormData {
  customer_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
}

export function Invoices() {
  const [invoices, setInvoices] = useState<(Invoice & { customer?: Customer })[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>({
    customer_id: '',
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    status: 'draft',
    notes: '',
  });

  useEffect(() => {
    loadInvoices();
    loadCustomers();
  }, []);

  useEffect(() => {
    const subtotal = Number(formData.subtotal) || 0;
    const discount = Number(formData.discount) || 0;
    const tax = Number(formData.tax) || 0;
    const total = subtotal - discount + tax;
    setFormData((prev) => ({ ...prev, total }));
  }, [formData.subtotal, formData.discount, formData.tax]);

  const loadCustomers = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.user.id)
        .maybeSingle();

      if (!companies) return;

      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', companies.id)
        .order('name');

      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadInvoices = async () => {
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

      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*, customers(*)')
        .eq('company_id', companies.id)
        .order('created_at', { ascending: false });

      setInvoices((invoicesData || []).map((inv: any) => ({
        ...inv,
        customer: inv.customers,
      })));
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.user.id)
        .maybeSingle();

      if (!companies) return;

      const invoiceData = {
        ...formData,
        company_id: companies.id,
        customer_id: formData.customer_id || null,
      };

      if (editingInvoice) {
        await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', editingInvoice.id);
      } else {
        await supabase.from('invoices').insert([invoiceData]);
      }

      setShowModal(false);
      setEditingInvoice(null);
      resetForm();
      loadInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customer_id: invoice.customer_id || '',
      invoice_number: invoice.invoice_number,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      subtotal: Number(invoice.subtotal),
      discount: Number(invoice.discount),
      tax: Number(invoice.tax),
      total: Number(invoice.total),
      status: invoice.status as any,
      notes: invoice.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingInvoice) return;

    try {
      await supabase.from('invoices').delete().eq('id', deletingInvoice.id);
      setShowDeleteDialog(false);
      setDeletingInvoice(null);
      loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      invoice_number: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      status: 'draft',
      notes: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'sent':
        return 'bg-blue-100 text-blue-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: 'Pago',
      sent: 'Enviado',
      overdue: 'Vencido',
      draft: 'Rascunho',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + Number(i.total), 0);

  const totalPending = invoices
    .filter((i) => i.status === 'sent')
    .reduce((sum, i) => sum + Number(i.total), 0);

  const totalOverdue = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + Number(i.total), 0);

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
          <h2 className="text-2xl font-bold text-gray-900">Notas Fiscais</h2>
          <p className="text-gray-600 mt-1">Gerencie suas faturas e notas fiscais</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingInvoice(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white px-6 py-3 rounded-lg hover:from-[#b8934f] hover:to-[#c4a056] transition-all duration-200 flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Nova Nota Fiscal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Total de NFs</p>
          <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Pagas</p>
          <p className="text-2xl font-bold text-green-600">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalPaid)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
          <p className="text-sm text-gray-600 mb-1">Pendentes</p>
          <p className="text-2xl font-bold text-orange-600">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalPending)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">Vencidas</p>
          <p className="text-2xl font-bold text-red-600">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalOverdue)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Data Emissão
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500">Nenhuma nota fiscal cadastrada</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Clique em "Nova Nota Fiscal" para começar
                    </p>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{invoice.invoice_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={18} className="text-gray-400" />
                        <span className="text-gray-700">{invoice.customer?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        <span className="text-gray-700">
                          {new Date(invoice.issue_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700">
                        {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(Number(invoice.total))}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingInvoice(invoice);
                            setShowDeleteDialog(true);
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
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingInvoice(null);
          resetForm();
        }}
        title={editingInvoice ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número da NF *
              </label>
              <input
                type="text"
                required
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
                placeholder="NF-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Emissão *
              </label>
              <input
                type="date"
                required
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Vencimento *
              </label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtotal *
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.subtotal}
                onChange={(e) => setFormData({ ...formData, subtotal: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desconto
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impostos
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.total}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              >
                <option value="draft">Rascunho</option>
                <option value="sent">Enviado</option>
                <option value="paid">Pago</option>
                <option value="overdue">Vencido</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8a35f] focus:border-transparent"
              placeholder="Informações adicionais..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingInvoice(null);
                resetForm();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c8a35f] to-[#d4b066] text-white rounded-lg hover:from-[#b8934f] hover:to-[#c4a056] transition-all duration-200"
            >
              {editingInvoice ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingInvoice(null);
        }}
        onConfirm={handleDelete}
        title="Excluir Nota Fiscal"
        message={`Tem certeza que deseja excluir a nota fiscal ${deletingInvoice?.invoice_number}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
