import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Scissors, 
  Search,
  Filter,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  title: string;
  start_at: string;
  status: string;
  client_profiles: { company_name: string };
}

export default function Agenda() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (err) {
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(app => 
    app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.client_profiles?.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Agenda</h2>
          <p className="text-gray-500 font-medium">Gerencie suas marcações e horários.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          <Plus size={20} />
          Novo Agendamento
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por cliente ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
          />
        </div>
        <button className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-gray-500 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
          <Filter size={20} />
          Filtros
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CalendarIcon size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h3>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl">Hoje</button>
            <button className="px-4 py-2 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">Semana</button>
          </div>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-bold">Carregando agenda...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <CalendarIcon size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum agendamento</h3>
              <p className="text-gray-500 font-medium">Você ainda não tem marcações para este período.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredAppointments.map((app) => (
                <div key={app.id} className="p-6 flex items-center gap-6 hover:bg-gray-50 transition-all group">
                  <div className="text-center min-w-[80px]">
                    <p className="text-lg font-black text-gray-900 leading-none mb-1">
                      {format(new Date(app.start_at), 'HH:mm')}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Início</p>
                  </div>
                  
                  <div className="w-px h-12 bg-gray-100" />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User size={14} className="text-gray-400" />
                      <p className="text-sm font-bold text-gray-900">{app.client_profiles?.company_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scissors size={14} className="text-gray-400" />
                      <p className="text-xs font-medium text-gray-500">{app.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={14} />
                      <span className="text-xs font-bold">45 min</span>
                    </div>
                    <span className={cn(
                      "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                      app.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {app.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </span>
                    <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
