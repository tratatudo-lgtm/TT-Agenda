import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Bell, 
  CreditCard, 
  Building2,
  Save,
  Loader2,
  ExternalLink,
  Globe,
  Users as StaffIcon,
  Plus,
  Trash2,
  Edit2,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';
import { BusinessSettings, Staff } from '../types';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../stores/useAuthStore';
import { getDefaultCurrency } from '../utils/format';
import StaffModal from '../components/StaffModal';

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
  const { user, setCountry: setGlobalCountry, setCurrency: setGlobalCurrency, staffList, setStaffList } = useAuthStore();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Staff management
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffSubmitting, setStaffSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchStaff();
  }, [user]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/client/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Fallback
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

  const fetchStaff = async () => {
    try {
      const response = await api.get('/api/client/staff');
      setStaffList(response.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) {
      toast.error('Definições não carregadas corretamente.');
      return;
    }

    setSaving(true);
    try {
      console.log('Saving settings with payload:', settings);
      const res = await api.put('/api/client/settings', settings);
      console.log('Save settings response:', res.data);
      
      setGlobalCountry(settings.country);
      setGlobalCurrency(settings.currency);
      toast.success('Definições guardadas com sucesso!');
    } catch (error: any) {
      console.error('Save error:', error);
      const msg = error.response?.data?.error || 'Erro ao guardar definições no servidor.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      console.log('Creating customer portal session...');
      const res = await api.post('/api/stripe/create-customer-portal-session');
      if (res.data?.url) {
        console.log('Redirecting to Stripe portal:', res.data.url);
        window.location.href = res.data.url;
      } else {
        throw new Error('URL do portal não retornada');
      }
    } catch (error) {
      console.error('Stripe portal error:', error);
      toast.error('Erro ao abrir portal de faturação. Tente novamente mais tarde.');
    }
  };

  const handleExportCSV = async () => {
    try {
      toast.loading('A gerar exportação...', { id: 'export' });
      const res = await api.get('/api/client/customers');
      const clients = res.data || [];
      
      const csvContent = [
        ['Nome', 'Telefone', 'Email'],
        ...clients.map((c: any) => [c.name, c.phone_e164, c.email || ''])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clientes-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Clientes exportados com sucesso!', { id: 'export' });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar clientes.', { id: 'export' });
    }
  };

  const handleStaffSubmit = async (data: any) => {
    setStaffSubmitting(true);
    try {
      if (editingStaff) {
        await api.put(`/api/client/staff/${editingStaff.id}`, data);
        toast.success('Funcionário atualizado!');
      } else {
        await api.post('/api/client/staff', data);
        toast.success('Funcionário adicionado!');
      }
      setIsStaffModalOpen(false);
      setEditingStaff(null);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao processar funcionário');
    } finally {
      setStaffSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Remover este funcionário?')) return;
    try {
      await api.delete(`/api/client/staff/${id}`);
      toast.success('Funcionário removido');
      fetchStaff();
    } catch (error) {
      toast.error('Erro ao remover funcionário');
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
          ...(settings.working_hours?.[dayId] || { open: '09:00', close: '19:00', closed: false }),
          [field]: value
        }
      }
    });
  };

  if (loading) return <div className="p-20 text-center text-slate-400">Carregando definições...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Definições</h2>
          <p className="text-slate-500 font-medium">Gerencie as configurações do seu negócio.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
          >
            <Download size={20} />
            Exportar Clientes
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Guardar Alterações
          </button>
        </div>
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
                  value={settings?.company_name || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, company_name: e.target.value } : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Telefone de Contacto</label>
                <input 
                  type="text" 
                  value={user?.phone_e164 || ''}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-4 text-slate-500 font-medium outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Staff Section */}
        <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
                <StaffIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Equipa</h3>
            </div>
            <button
              onClick={() => {
                if (staffList.length >= 3) {
                  toast.error('Limite de 3 funcionários atingido no plano Profissional.');
                  return;
                }
                setEditingStaff(null);
                setIsStaffModalOpen(true);
              }}
              disabled={staffList.length >= 3}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Adicionar
            </button>
          </div>
          <div className="p-8">
            {staffList.length > 0 ? (
              <div className="grid gap-4">
                {staffList.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: staff.color }}>
                        {staff.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{staff.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{staff.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingStaff(staff);
                          setIsStaffModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 font-medium">
                Nenhum funcionário adicionado.
              </div>
            )}
            {staffList.length >= 3 && (
              <p className="mt-4 text-xs text-amber-600 font-bold bg-amber-50 p-3 rounded-xl border border-amber-100">
                Atingiu o limite de 3 funcionários do seu plano. Faça upgrade para adicionar mais.
              </p>
            )}
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
                value={settings?.country || 'PT'}
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
                value={settings?.currency || 'EUR'}
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
              const config = settings?.working_hours?.[day.id] || { open: '09:00', close: '19:00', closed: day.id === 'sunday' };
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
                        value={config?.open || '09:00'}
                        onChange={(e) => updateWorkingHour(day.id, 'open', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <span className="text-slate-400 font-bold">até</span>
                      <input 
                        type="time" 
                        value={config?.close || '19:00'}
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
            <button 
              onClick={handleManageSubscription}
              className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
            >
              Gerir Assinatura
              <ExternalLink size={18} />
            </button>
          </div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </section>
      </div>

      <StaffModal 
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSubmit={handleStaffSubmit}
        initialData={editingStaff}
        submitting={staffSubmitting}
      />
    </div>
  );
}
