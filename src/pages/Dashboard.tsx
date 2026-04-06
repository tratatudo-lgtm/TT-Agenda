import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Calendar, 
  Users, 
  Scissors, 
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../utils';

interface Stats {
  todayAppointments: number;
  totalClients: number;
  totalServices: number;
  revenue?: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await api.get('/v1/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error loading stats', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const cards = [
    { 
      label: 'Agendamentos Hoje', 
      value: stats?.todayAppointments || 0, 
      icon: Calendar, 
      color: 'bg-blue-500',
      trend: '+12%'
    },
    { 
      label: 'Total de Clientes', 
      value: stats?.totalClients || 0, 
      icon: Users, 
      color: 'bg-indigo-500',
      trend: '+5%'
    },
    { 
      label: 'Serviços Ativos', 
      value: stats?.totalServices || 0, 
      icon: Scissors, 
      color: 'bg-purple-500',
      trend: 'Estável'
    },
    { 
      label: 'Faturação Prevista', 
      value: formatCurrency(stats?.revenue || 1250.50), 
      icon: TrendingUp, 
      color: 'bg-emerald-500',
      trend: '+8%'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500">Visão geral do seu negócio hoje.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-xl text-white", card.color)}>
                <card.icon size={24} />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {card.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Próximos Agendamentos</h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Ver todos</button>
          </div>
          <div className="divide-y divide-gray-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <Users size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Cliente Exemplo {i}</p>
                  <p className="text-xs text-gray-500">Corte de Cabelo Masculino</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">14:30</p>
                  <p className="text-xs text-emerald-600 font-medium">Confirmado</p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
            <h3 className="font-bold text-lg mb-2">Novo Agendamento</h3>
            <p className="text-indigo-100 text-sm mb-6">Marque um novo serviço para um cliente em segundos.</p>
            <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
              Criar Agora
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Horário de Funcionamento</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Segunda - Sexta</span>
                <span className="font-medium text-gray-900">09:00 - 19:00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Sábado</span>
                <span className="font-medium text-gray-900">09:00 - 13:00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Domingo</span>
                <span className="text-red-500 font-medium">Fechado</span>
              </div>
            </div>
            <button className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Clock size={16} />
              Gerir Horários
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
