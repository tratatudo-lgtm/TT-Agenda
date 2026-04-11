import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const localizer = momentLocalizer(moment);

interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  client_profile?: { company_name: string };
  service?: { name: string };
}

export default function Agenda() {
  const [events, setEvents] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/client/appointments');
      const appointments = (res.data || []).map((apt: any) => ({
        id: apt.id,
        title: `${apt.client_profile?.company_name || 'Cliente'} - ${apt.service?.name || 'Serviço'}`,
        start: new Date(apt.start_at),
        end: new Date(apt.end_at || apt.start_at),
      }));
      setEvents(appointments);
    } catch (err: any) {
      console.error('Erro ao carregar agenda:', err);
      setError('Não foi possível carregar os agendamentos.');
      toast.error('Erro ao carregar dados da agenda');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500">Gerencie os seus horários e marcações.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} />
          Novo Agendamento
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
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
      </div>
    </div>
  );
}
