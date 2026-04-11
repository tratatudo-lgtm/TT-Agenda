import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../lib/api';

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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/api/client/appointments');
      const appointments = res.data.map((apt: any) => ({
        id: apt.id,
        title: `${apt.client_profile?.company_name || 'Cliente'} - ${apt.service?.name || 'Serviço'}`,
        start: new Date(apt.start_at),
        end: new Date(apt.end_at),
        client_profile: apt.client_profile,
        service: apt.service,
      }));
      setEvents(appointments);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando agenda...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-500">Gerencie todos os seus agendamentos.</p>
      </div>
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
          }}
        />
      </div>
    </div>
  );
}