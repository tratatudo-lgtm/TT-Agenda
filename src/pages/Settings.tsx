import React from 'react';
import { 
  Settings as SettingsIcon, 
  Clock, 
  User, 
  Bell, 
  Shield, 
  Smartphone,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  const days = [
    'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 
    'Sexta-feira', 'Sábado', 'Domingo'
  ];

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Configurações</h2>
        <p className="text-gray-500 font-medium">Personalize o funcionamento do seu negócio.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="lg:col-span-1">
          <nav className="space-y-2">
            {[
              { name: 'Perfil do Negócio', icon: User, active: true },
              { name: 'Horários', icon: Clock },
              { name: 'Notificações', icon: Bell },
              { name: 'Segurança', icon: Shield },
              { name: 'Integrações', icon: Smartphone },
            ].map((item) => (
              <button
                key={item.name}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  item.active 
                    ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </button>
            ))}
          </nav>
        </aside>

        <div className="lg:col-span-3 space-y-8">
          {/* Business Profile */}
          <section className="bg-white rounded-[32px] p-8 lg:p-10 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <User size={20} className="text-indigo-600" />
              Perfil do Negócio
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nome da Empresa</label>
                <input 
                  type="text" 
                  defaultValue={user?.company_name}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">WhatsApp de Contato</label>
                <input 
                  type="text" 
                  defaultValue={user?.phone_e164}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500"
                  disabled
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bio / Descrição</label>
                <textarea 
                  rows={3}
                  placeholder="Conte um pouco sobre o seu negócio..."
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Working Hours */}
          <section className="bg-white rounded-[32px] p-8 lg:p-10 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Clock size={20} className="text-indigo-600" />
                Horários de Funcionamento
              </h3>
              <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Copiar para todos</button>
            </div>

            <div className="space-y-4">
              {days.map((day) => (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50 rounded-[24px] gap-4">
                  <span className="font-bold text-gray-900 min-w-[140px]">{day}</span>
                  <div className="flex items-center gap-4">
                    <input type="time" defaultValue="09:00" className="bg-white border-none rounded-xl px-4 py-2 text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500" />
                    <span className="text-gray-300 font-bold">até</span>
                    <input type="time" defaultValue="18:00" className="bg-white border-none rounded-xl px-4 py-2 text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aberto</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <button className="bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
              <Save size={20} />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
