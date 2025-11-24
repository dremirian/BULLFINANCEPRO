import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Bell, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Alert } from '../../types/database';

export function AlertsDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
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

      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('company_id', companies.id)
        .order('created_at', { ascending: false });

      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle size={20} />;
      case 'medium':
      case 'low':
        return <AlertCircle size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'unread') return !alert.read;
    if (filter === 'critical') return alert.severity === 'critical' || alert.severity === 'high';
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.resolved).length;
  const unreadCount = alerts.filter((a) => !a.read).length;

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
          <h2 className="text-2xl font-bold text-gray-900">Alertas e Notificações</h2>
          <p className="text-gray-600 mt-1">Central de alertas inteligentes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#c8a35f] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-[#c8a35f] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Não Lidos ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'critical'
                ? 'bg-[#c8a35f] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Críticos ({criticalCount})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">Alertas Críticos</p>
          <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Não Lidos</p>
          <p className="text-2xl font-bold text-yellow-600">{unreadCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Total de Alertas</p>
          <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Resolvidos Hoje</p>
          <p className="text-2xl font-bold text-green-600">
            {alerts.filter((a) => a.resolved).length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500">Nenhum alerta encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Você está em dia!</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 p-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg ${getSeverityColor(
                alert.severity
              )} ${alert.read ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2 rounded-lg bg-white/50">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{alert.title}</h3>
                      {!alert.read && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                          Novo
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="px-2 py-1 bg-white/70 rounded">
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-gray-600">
                        {new Date(alert.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                    <Check size={18} />
                  </button>
                  <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
