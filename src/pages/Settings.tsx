import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Bell, 
  CreditCard, 
  Building2,
  Save,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';
import { BusinessSettings } from '../types';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../stores/useAuthStore';
import { getDefaultCurrency } from '../utils/format';
import { Globe } from 'lucide-react';

const daysOfWeek = [
  { id: 'monday', label: 'Segunda-feira' },
  { id: 'tuesday', label: 'Terça-feira' },
  { id: 'wednesday', label: 'Quarta-feira' },
  { id: 'thursday', label: 'Quinta-feira' },
  { id: 'friday', label: 'Sexta-feira' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
];

export default function Settings() {
  const { user, setCountry: setGlobalCountry, setCurrency: setGlobalCurrency } = useAuthStore();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/api/client/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Mock default settings if API fails for demo
        setSettings({
          company_name: user?.company_name || '',
          country: user?.country || 'PT',
          currency: user?.currency || 'EUR',
          working_hours: daysOfWeek.reduce((acc, day) => ({
            ...acc,
            [day.id]: { open: '09:00', close: '19:00', closed: day.id === 'sunday' }
          }), {}),
          appointment_interval: 30,
          notifications_enabled: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      await api.put('/api/client/settings', settings);
      setGlobalCountry(settings.country);
      setGlobalCurrency(settings.currency);
      toast.success('Definições guardadas com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao guardar definições');
    } finally {
      setSaving(false);
    }
  };

  const handleCountryChange = (countryCode: string) => {
    if (!settings) return;
    const suggestedCurrency = getDefaultCurrency(countryCode);
    setSettings({
      ...settings,
      country: countryCode,
      currency: suggestedCurrency
    });
  };

  const updateWorkingHour = (dayId: string, field: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      working_hours: {
        ...settings.working_hours,
        [dayId]: {
          ...settings.working_hours[dayId],
          [field]: value
        }
      }
    });
  };

  if (loading) return <div className="p-20 text-center text-slate-400">Carregando definições...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Definições</h2>
          <p className="text-slate-500 font-medium">Gerencie as configurações do seu negócio.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Guardar Alterações
        </button>
      </header>

      <div className="grid gap-8">
        {/* Business Info */}
        <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
              <Building2 size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Informações do Negócio</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Nome da Empresa</label>
                <input 
                  type="text" 
                  value={settings?.company_name}
                  onChange={(e) => setSettings(s => s ? { ...s, company_name: e.target.value } : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Telefone de Contacto</label>
                <input 
                  type="text" 
                  value={user?.phone_e164}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-4 text-slate-500 font-medium outline-none cursor-not-allowed"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Intervalo entre Agendamentos</label>
                <select 
                  value={settings?.appointment_interval}
                  onChange={(e) => setSettings(s => s ? { ...s, appointment_interval: parseInt(e.target.value) } : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Notificações WhatsApp</label>
                <div className="flex items-center gap-3 h-[58px] px-4 bg-slate-50 rounded-xl border border-slate-200">
                  <input 
                    type="checkbox" 
                    id="notif"
                    checked={settings?.notifications_enabled}
                    onChange={(e) => setSettings(s => s ? { ...s, notifications_enabled: e.target.checked } : null)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="notif" className="text-slate-700 font-medium cursor-pointer flex items-center gap-2">
                    <Bell size={18} className="text-slate-400" />
                    Ativar lembretes automáticos
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location and Currency */}
        <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
              <Globe size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Localização e Moeda</h3>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">País</label>
              <select 
                value={settings?.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
              >
                <option value="PT">Portugal</option>
                <option value="BR">Brasil</option>
                <option value="ES">Espanha</option>
                <option value="FR">França</option>
                <option value="GB">Reino Unido</option>
                <option value="US">Estados Unidos</option>
                <option value="CH">Suíça</option>
                <option value="AO">Angola</option>
                <option value="MZ">Moçambique</option>
                <option value="CV">Cabo Verde</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Moeda</label>
              <select 
                value={settings?.currency}
                onChange={(e) => setSettings(s => s ? { ...s, currency: e.target.value } : null)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
              >
                <option value="EUR">Euro (€)</option>
                <option value="BRL">Real (R$)</option>
                <option value="GBP">Libra (£)</option>
                <option value="USD">Dólar ($)</option>
                <option value="CHF">Franco Suíço (CHF)</option>
                <option value="AOA">Kwanza (AOA)</option>
                <option value="MZN">Metical (MZN)</option>
                <option value="CVE">Escudo (CVE)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Working Hours */}
        <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
              <Clock size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Horário de Funcionamento</h3>
          </div>
          <div className="p-8 divide-y divide-slate-100">
            {daysOfWeek.map((day) => {
              const config = settings?.working_hours[day.id];
              return (
                <div key={day.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-[180px]">
                    <input 
                      type="checkbox" 
                      checked={!config?.closed}
                      onChange={(e) => updateWorkingHour(day.id, 'closed', !e.target.checked)}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`font-bold ${config?.closed ? 'text-slate-400' : 'text-slate-900'}`}>{day.label}</span>
                  </div>
                  
                  {!config?.closed ? (
                    <div className="flex items-center gap-3">
                      <input 
                        type="time" 
                        value={config?.open}
                        onChange={(e) => updateWorkingHour(day.id, 'open', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <span className="text-slate-400 font-bold">até</span>
                      <input 
                        type="time" 
                        value={config?.close}
                        onChange={(e) => updateWorkingHour(day.id, 'close', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Encerrado</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Subscription */}
        <section className="bg-slate-900 text-white rounded-[32px] p-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-widest">
                <CreditCard size={16} />
                Plano Atual
              </div>
              <h3 className="text-3xl font-bold">Plano Profissional</h3>
              <p className="text-slate-400 font-medium">Próximo pagamento: € 29.00 em 01 de Maio, 2026</p>
            </div>
            <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
              Gerir Assinatura
              <ExternalLink size={18} />
            </button>
          </div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </section>
      </div>
    </div>
  );
}
