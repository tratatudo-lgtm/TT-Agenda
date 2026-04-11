import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, X, Loader2, Clock, User, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import { Appointment, Customer, Service } from '../types';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../stores/useAuthStore';
import { formatCurrency } from '../utils/format';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const appointmentSchema = z.object({
  customer_id: z.string().min(1, 'Selecione um cliente'),
  service_id: z.string().min(1, 'Selecione um serviço'),
  start_at: z.string().min(1, 'Selecione data e hora'),
  notes: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

export default function Agenda() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const currency = useAuthStore((state) => state.currency);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
  });

  const selectedServiceId = watch('service_id');

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
        console.error('Error fetching agenda data:', error);
        toast.error('Erro ao carregar dados da agenda');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: AppointmentForm) => {
    setSubmitting(true);
    try {
      // Calculate end_at based on service duration
      const service = services.find(s => s.id === data.service_id);
      const start = new Date(data.start_at);
      const end = new Date(start.getTime() + (service?.duration_minutes || 30) * 60000);
      
      await api.post('/api/client/appointments', {
        ...data,
        end_at: end.toISOString(),
      });
      
      toast.success('Agendamento criado com sucesso!');
      setIsModalOpen(false);
      reset();
      // Refresh appointments
      const response = await api.get('/api/client/appointments');
      setAppointments(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar agendamento');
    } finally {
      setSubmitting(false);
    }
  };

  const events = appointments.map(app => ({
    id: app.id,
    title: `${app.customer?.name} - ${app.service?.name}`,
    start: new Date(app.start_at),
    end: new Date(app.end_at),
    resource: app,
  }));

  return (
    <div className="h-full flex flex-col space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Agenda</h2>
          <p className="text-slate-500 font-medium">Gerencie os seus horários e marcações.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          Novo Agendamento
        </button>
      </header>

      <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mr-2" />
            Carregando agenda...
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 'calc(100vh - 300px)' }}
            messages={{
              next: "Próximo",
              previous: "Anterior",
              today: "Hoje",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              agenda: "Agenda",
              date: "Data",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "Não há agendamentos neste período.",
            }}
            culture="pt-BR"
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            defaultView={Views.WEEK}
            onSelectEvent={(event) => {
              toast(`Agendamento: ${event.title}`);
            }}
          />
        )}
      </div>

      {/* Add Appointment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">Novo Agendamento</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <User size={16} /> Cliente
                  </label>
                  <select 
                    {...register('customer_id')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Selecione um cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone_e164})</option>
                    ))}
                  </select>
                  {errors.customer_id && <p className="text-red-500 text-xs font-bold">{errors.customer_id.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Scissors size={16} /> Serviço
                  </label>
                  <select 
                    {...register('service_id')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Selecione um serviço...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price, currency)} ({s.duration_minutes}min)</option>
                    ))}
                  </select>
                  {errors.service_id && <p className="text-red-500 text-xs font-bold">{errors.service_id.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={16} /> Data e Hora de Início
                  </label>
                  <input 
                    {...register('start_at')}
                    type="datetime-local"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  {errors.start_at && <p className="text-red-500 text-xs font-bold">{errors.start_at.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Notas Adicionais</label>
                  <textarea 
                    {...register('notes')}
                    rows={2}
                    placeholder="Alguma observação especial?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar Marcação'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
