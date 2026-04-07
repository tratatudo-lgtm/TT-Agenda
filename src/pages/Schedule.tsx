import { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Calendar,
  AlertCircle,
  Save
} from 'lucide-react';

interface Schedule {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface Override {
  id: string;
  date: string;
  isClosed: boolean;
  openTime?: string;
  closeTime?: string;
  reason?: string;
}

export default function Schedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const response = await api.get('/v1/schedule');
        setSchedules(response.data.schedules);
        setOverrides(response.data.overrides);
      } catch (error) {
        console.error('Error loading schedule', error);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, []);

  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Horários & Bloqueios</h2>
        <p className="text-gray-500">Defina os horários de funcionamento e exceções.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Schedule */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" />
              Horário Semanal
            </h3>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <Save size={16} />
              Guardar
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Carregando...</div>
            ) : schedules.map((s) => (
              <div key={s.dayOfWeek} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="text-sm font-bold text-gray-700 w-24">{days[s.dayOfWeek]}</span>
                <div className="flex items-center gap-4">
                  {s.isClosed ? (
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider">Fechado</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input 
                        type="time" 
                        defaultValue={s.openTime}
                        className="text-sm border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                      <span className="text-gray-400">-</span>
                      <input 
                        type="time" 
                        defaultValue={s.closeTime}
                        className="text-sm border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  )}
                  <button className="text-xs font-bold text-indigo-600 hover:underline">
                    {s.isClosed ? 'Abrir' : 'Fechar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overrides / Holidays */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600" />
              Bloqueios & Exceções
            </h3>
            <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
              <Plus size={20} />
            </button>
          </div>
          <div className="p-6">
            {overrides.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Sem bloqueios ativos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {overrides.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{new Date(o.date).toLocaleDateString('pt-PT')}</p>
                      <p className="text-xs text-gray-500">{o.reason || 'Bloqueio de agenda'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-red-500 uppercase">Fechado</span>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
