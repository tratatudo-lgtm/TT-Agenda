import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Calendar as CalendarIcon, Clock, User, Scissors } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  date: string;
  customers: { name: string };
  services: { name: string; duration: number };
  status: string;
}

export default function Agenda() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments')
      .then(res => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Agenda</h2>
          <p className="text-gray-500 font-medium">Gerencie suas marcações e horários.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
          <Plus size={20} />
          Novo Agendamento
        </button>
      </header>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
            <CalendarIcon size={18} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-900">
              {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl">Hoje</button>
            <button className="px-4 py-2 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">Semana</button>
          </div>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <CalendarIcon size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Nenhum agendamento</h3>
              <p className="text-gray-500 font-medium">Você ainda não tem marcações para hoje.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {appointments.map((app) => (
                <div key={app.id} className="p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors">
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm font-black text-gray-900">{format(new Date(app.date), 'HH:mm')}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Início</p>
                  </div>
                  
                  <div className="w-px h-10 bg-gray-100" />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User size={14} className="text-gray-400" />
                      <p className="text-sm font-bold text-gray-900">{app.customers.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scissors size={14} className="text-gray-400" />
                      <p className="text-xs font-medium text-gray-500">{app.services.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock size={14} />
                      <span className="text-xs font-bold">{app.services.duration} min</span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                      {app.status}
                    </span>
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
