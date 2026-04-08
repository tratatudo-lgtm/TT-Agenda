import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { 
  Calendar, 
  Users, 
  Scissors, 
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface Stats {
  appointments: number;
  customers: number;
  services: number;
  revenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Agendamentos', value: stats?.appointments || 0, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Clientes', value: stats?.customers || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Serviços', value: stats?.services || 0, icon: Scissors, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Faturamento', value: `R$ ${stats?.revenue || 0}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-8 w-48 bg-gray-200 rounded-lg" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-[24px]" />)}
    </div>
  </div>;

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Bem-vindo de volta!</h2>
        <p className="text-gray-500 font-medium">Aqui está o resumo do seu negócio hoje.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} ${card.color} p-3 rounded-2xl`}>
                <card.icon size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Próximos Agendamentos</h3>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Ver todos</button>
          </div>
          <div className="divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                  <Clock size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">João Silva</p>
                  <p className="text-xs font-medium text-gray-400">Corte de Cabelo • 14:30</p>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Novo Agendamento</h3>
            <p className="text-indigo-100 font-medium">Crie uma nova marcação rapidamente para seus clientes.</p>
          </div>
          <button className="mt-8 w-full bg-white text-indigo-600 rounded-2xl py-4 font-bold hover:bg-indigo-50 transition-colors">
            Agendar Agora
          </button>
        </div>
      </div>
    </div>
  );
}
