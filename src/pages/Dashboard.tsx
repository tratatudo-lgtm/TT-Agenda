import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Scissors, TrendingUp, Plus, Ticket } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../stores/useAuthStore';

interface Appointment {
  id: string;
  client_profile?: { company_name: string };
  service?: { name: string };
  start_at: string;
  status: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalClients: 0,
    totalServices: 0,
    revenue: 0,
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Buscar agendamentos
        const appointmentsRes = await api.get('/api/client/appointments');
        const allAppointments = appointmentsRes.data || [];
        
        // Filtrar agendamentos de hoje
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = allAppointments.filter((apt: Appointment) => 
          apt.start_at?.startsWith(today)
        );

        // Buscar clientes
        const clientsRes = await api.get('/api/client/customers');
        
        // Buscar serviços
        const servicesRes = await api.get('/api/client/services');

        setStats({
          todayAppointments: todayAppointments.length,
          totalClients: clientsRes.data?.length || 0,
          totalServices: servicesRes.data?.length || 0,
          revenue: 0, // TODO: Calcular com base nos agendamentos
        });

        // Próximos agendamentos (ordenados por data)
        const upcoming = allAppointments
          .filter((apt: Appointment) => new Date(apt.start_at) >= new Date())
          .sort((a: Appointment, b: Appointment) => 
            new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
          )
          .slice(0, 5);
        
        setAppointments(upcoming);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel de Controlo</h1>
        <p className="text-gray-500">Bem-vindo ao seu centro de operações, {user?.name || user?.company_name}.</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Agendamentos Hoje"
          value={stats.todayAppointments}
          icon={<Calendar size={24} />}
          color="bg-blue-500"
        />
        <StatCard
          label="Total de Clientes"
          value={stats.totalClients}
          icon={<Users size={24} />}
          color="bg-indigo-500"
        />
        <StatCard
          label="Serviços Ativos"
          value={stats.totalServices}
          icon={<Scissors size={24} />}
          color="bg-purple-500"
        />
        <StatCard
          label="Faturação Prevista"
          value={`€ ${stats.revenue.toFixed(2)}`}
          icon={<TrendingUp size={24} />}
          color="bg-emerald-500"
        />
      </div>

      {/* Ações rápidas */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/agenda')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} />
          Novo Agendamento
        </button>
        <button
          onClick={() => navigate('/suporte')}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          <Ticket size={20} />
          Abrir Ticket
        </button>
      </div>

      {/* Próximos Agendamentos */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Próximos Agendamentos</h3>
          <button
            onClick={() => navigate('/agenda')}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Ver todos
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {appointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Sem agendamentos próximos
              <p className="text-sm text-gray-400 mt-1">Os seus novos agendamentos aparecerão aqui.</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <Users size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    {apt.client_profile?.company_name || 'Cliente'}
                  </p>
                  <p className="text-xs text-gray-500">{apt.service?.name || 'Serviço'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(apt.start_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">{apt.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl text-white ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  );
}