import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { 
  Calendar, 
  Users, 
  Scissors, 
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  Megaphone
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

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
    async function fetchStats() {
      try {
        // Mocking stats for now since backend only has counts
        const [appRes, custRes, servRes] = await Promise.all([
          api.get('/appointments'),
          api.get('/customers'),
          api.get('/services')
        ]);
        
        setStats({
          appointments: appRes.data.length,
          customers: custRes.data.length,
          services: servRes.data.length,
          revenue: 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { label: 'Agendamentos', value: stats?.appointments || 0, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Clientes', value: stats?.customers || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Serviços', value: stats?.services || 0, icon: Scissors, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Faturamento', value: `R$ ${stats?.revenue || 0}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (loading) return (
    <div className="animate-pulse space-y-10">
      <div className="h-10 w-64 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-[32px]" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h2>
          <p className="text-gray-500 font-medium">Visão geral do seu negócio hoje.</p>
        </div>
        <Link 
          to="/agenda" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          Novo Agendamento
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
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
            <Link to="/agenda" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Ver todos</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                  <Clock size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Cliente Exemplo {i}</p>
                  <p className="text-xs font-medium text-gray-400">Corte de Cabelo • 14:30</p>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Atalhos Rápidos</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-indigo-600 shadow-sm">
                <Users size={20} />
              </div>
              <span className="font-bold text-sm">Novo Cliente</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-indigo-600 shadow-sm">
                <Scissors size={20} />
              </div>
              <span className="font-bold text-sm">Novo Serviço</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-indigo-600 shadow-sm">
                <Megaphone size={20} />
              </div>
              <span className="font-bold text-sm">Criar Campanha</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
