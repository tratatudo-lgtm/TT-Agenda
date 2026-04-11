import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, RefreshCcw, Loader2, X, Clock, User, Scissors, Users as StaffIcon } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { Appointment, Staff, Customer, Service } from '../types';
import { useAuthStore } from '../stores/useAuthStore';
import StaffSelector from '../components/StaffSelector';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const localizer = momentLocalizer(moment);

const appointmentSchema = z.object({
  client_profile_id: z.string().min(1, 'Cliente é obrigatório'),
  service_id: z.string().min(1, 'Serviço é obrigatório'),
  staff_id: z.string().min(1, 'Funcionário é obrigatório'),
  start_at: z.string().min(1, 'Data de início é obrigatória'),
  end_at: z.string().min(1, 'Data de fim é obrigatória'),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

export default function Agenda() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  
  const { staffList, setStaffList } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedStaffId]);

  const fetchInitialData = async () => {
    try {
      const [staffRes, custRes, servRes] = await Promise.all([
        api.get('/api/client/staff'),
        api.get('/api/client/customers'),
        api.get('/api/client/services'),
      ]);
      setStaffList(staffRes.data || []);
      setCustomers(custRes.data || []);
      setServices(servRes.data || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching appointments for staff:', selectedStaffId);
      const res = await api.get('/api/client/appointments', {
        params: { staff_id: selectedStaffId !== 'all' ? selectedStaffId : undefined }
      });
      const appointments = (res.data || []).map((apt: any) => ({
        id: apt.id,
        title: `${apt.customer?.name || 'Cliente'} - ${apt.service?.name || 'Serviço'}`,
        start: new Date(apt.start_at),
        end: new Date(apt.end_at || apt.start_at),
        staff_id: apt.staff_id, // Ensure staff_id is at top level for style getter
        resource: apt,
        color: apt.staff?.color || '#4f46e5'
      }));
      setEvents(appointments);
    } catch (err: any) {
      console.error('Erro ao carregar agenda:', err);
      setError('Não foi possível carregar os agendamentos.');
      setEvents([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AppointmentForm) => {
    setSubmitting(true);
    try {
      console.log('Creating appointment:', data);
      await api.post('/api/client/appointments', data);
      toast.success('Agendamento criado com sucesso!');
      setShowModal(false);
      reset();
      fetchAppointments();
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar agendamento');
    } finally {
      setSubmitting(false);
    }
  };

  const eventStyleGetter = (event: any) => {
    const staff = staffList.find(s => s.id === event.staff_id);
    return {
      style: {
        backgroundColor: staff?.color || event.color || '#4f46e5',
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Agenda</h1>
          <p className="text-slate-500 font-medium">Gerencie os seus horários e a sua equipa.</p>
        </div>
        <div className="flex items-center gap-3">
          <StaffSelector 
            staffList={staffList} 
            selectedStaffId={selectedStaffId} 
            onSelect={setSelectedStaffId} 
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            Novo Agendamento
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
              <X size={20} />
            </div>
            <div>
              <p className="font-bold">{error}</p>
              <p className="text-sm opacity-80">Verifique a sua ligação ou tente novamente.</p>
            </div>
          </div>
          <button 
            onClick={fetchAppointments}
            className="flex items-center gap-2 px-4 py-2 bg-white text-rose-600 rounded-lg font-bold hover:bg-rose-100 transition-colors shadow-sm"
          >
            <RefreshCcw size={18} />
            Tentar novamente
          </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-[600px] flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 className="animate-spin" size={40} />
            <p className="font-bold">Sincronizando agenda...</p>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            eventPropGetter={eventStyleGetter}
            messages={{
              next: "Seguinte",
              previous: "Anterior",
              today: "Hoje",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              agenda: "Agenda",
              date: "Data",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "Sem agendamentos neste período.",
            }}
          />
        )}
      </div>

      {/* New Appointment Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
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
                  onClick={() => setShowModal(false)}
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
                    {...register('client_profile_id')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Selecionar Cliente</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.client_profile_id && <p className="text-red-500 text-xs font-bold">{errors.client_profile_id.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <Scissors size={16} /> Serviço
                    </label>
                    <select 
                      {...register('service_id')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    >
                      <option value="">Selecionar Serviço</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {errors.service_id && <p className="text-red-500 text-xs font-bold">{errors.service_id.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <StaffIcon size={16} /> Funcionário
                    </label>
                    <select 
                      {...register('staff_id')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    >
                      <option value="">Selecionar Funcionário</option>
                      {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {errors.staff_id && <p className="text-red-500 text-xs font-bold">{errors.staff_id.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={16} /> Início
                    </label>
                    <input 
                      {...register('start_at')}
                      type="datetime-local"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    {errors.start_at && <p className="text-red-500 text-xs font-bold">{errors.start_at.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={16} /> Fim
                    </label>
                    <input 
                      {...register('end_at')}
                      type="datetime-local"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    {errors.end_at && <p className="text-red-500 text-xs font-bold">{errors.end_at.message}</p>}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Criar Agendamento'}
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
