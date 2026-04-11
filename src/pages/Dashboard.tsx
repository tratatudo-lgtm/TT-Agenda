import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Users, 
  Scissors, 
  TrendingUp, 
  ArrowUpRight, 
  Plus,
  Clock,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';
import { Appointment, Customer, Service } from '../types';
import { format, isToday, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { formatCurrency } from '../utils/format';

const MetricCard = ({ icon: Icon, label, value, trend, color }: any) => (
  <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-emerald-600 text-sm font-bold bg-emerald-50 px-2 py-1 rounded-lg">
          <TrendingUp size={14} />
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 font-medium text-sm mb-1">{label}</p>
    <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
  </div>
);

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const currency = user?.currency || 'EUR';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, custRes, servRes] = await Promise.all([
          api.get('/api/client/appointments'),
          api.get('/api/client/customers'),
          api.get('/api/client/services'),
        ]);
        setAppointments(appsRes.data);
        setCustomers(custRes.data);
        setServices(servRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const todayAppointments = appointments.filter(app => isToday(new Date(app.start_at)));
  const futureAppointments = appointments.filter(app => isAfter(new Date(app.start_at), new Date()));
  const estimatedRevenue = futureAppointments.reduce((acc, app) => acc + (app.service?.price || 0), 0);
  const upcomingList = [...futureAppointments].sort((a, b) => 
    new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Painel de Controlo</h2>
          <p className="text-slate-500 font-medium">Bem-vindo ao seu centro de operações.</p>
        </div>
        <Link 
          to="/agenda"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          Novo Agendamento
        </Link>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={Calendar} 
          label="Agendamentos Hoje" 
          value={todayAppointments.length.toString()} 
          color="bg-indigo-50 text-indigo-600" 
        />
        <MetricCard 
          icon={Users} 
          label="Total de Clientes" 
          value={customers.length.toString()} 
          color="bg-emerald-50 text-emerald-600" 
        />
        <MetricCard 
          icon={Scissors} 
          label="Serviços Ativos" 
          value={services.length.toString()} 
          color="bg-amber-50 text-amber-600" 
        />
        <MetricCard 
          icon={TrendingUp} 
          label="Faturação Prevista" 
          value={formatCurrency(estimatedRevenue, currency)} 
          color="bg-rose-50 text-rose-600" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Próximos Agendamentos</h3>
            <Link to="/agenda" className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline">
              Ver todos <ChevronRight size={16} />
            </Link>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Carregando...</div>
            ) : upcomingList.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {upcomingList.map((app) => (
                  <div key={app.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-bold">
                        {app.customer?.name?.[0] || 'C'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{app.customer?.name || 'Cliente'}</h4>
                        <p className="text-sm text-slate-500 font-medium">{app.service?.name || 'Serviço'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                        <Clock size={16} className="text-slate-400" />
                        {format(new Date(app.start_at), 'HH:mm')}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {format(new Date(app.start_at), "dd 'de' MMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Calendar size={32} />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Sem agendamentos próximos</h4>
                <p className="text-slate-500 text-sm">Os seus novos agendamentos aparecerão aqui.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Support */}
        <div className="space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-[32px] relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Suporte Prioritário</h3>
              <p className="text-slate-400 text-sm mb-6">Precisa de ajuda com a plataforma? A nossa equipa está disponível.</p>
              <Link 
                to="/support"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
              >
                <MessageCircle size={18} />
                Abrir Ticket
              </Link>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Dicas de Crescimento</h3>
            <div className="space-y-6">
              {[
                { title: 'Ative lembretes WhatsApp', desc: 'Reduza faltas em até 40%.' },
                { title: 'Crie pacotes de serviços', desc: 'Aumente o ticket médio.' },
              ].map((tip, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{tip.title}</h4>
                    <p className="text-slate-500 text-xs mt-1">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
