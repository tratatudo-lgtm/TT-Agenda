import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Clock, Save, Loader2, CheckCircle2 } from 'lucide-react';

interface WorkingHour {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function Settings() {
  const [hours, setHours] = useState<WorkingHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/working-hours')
      .then(res => setHours(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    setSaving(true);
    // Mock save
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Configurações</h2>
          <p className="text-gray-500 font-medium">Ajuste os horários e preferências do seu negócio.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : (saved ? <CheckCircle2 size={20} /> : <Save size={20} />)}
          {saving ? 'Salvando...' : (saved ? 'Salvo!' : 'Salvar Alterações')}
        </button>
      </header>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Clock size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Horário de Funcionamento</h3>
        </div>

        <div className="p-8 space-y-4">
          {loading ? (
            [1,2,3,4,5,6,7].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />)
          ) : DAYS.map((day, i) => {
            const hour = hours.find(h => h.day_of_week === i) || { day_of_week: i, open_time: '09:00', close_time: '18:00', is_closed: false };
            return (
              <div key={day} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <span className="text-sm font-bold text-gray-900">{day}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={!hour.is_closed} className="sr-only peer" readOnly />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {!hour.is_closed && (
                  <div className="flex items-center gap-3">
                    <input 
                      type="time" 
                      value={hour.open_time} 
                      className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <span className="text-gray-400 font-bold">às</span>
                    <input 
                      type="time" 
                      value={hour.close_time} 
                      className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}

                {hour.is_closed && (
                  <span className="text-sm font-bold text-red-400 uppercase tracking-widest">Fechado</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
