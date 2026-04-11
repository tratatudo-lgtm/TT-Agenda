import React, { useEffect, useState } from 'react';
import { Plus, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  kind?: string;
}

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/client/tickets');
      setTickets(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      await api.post('/api/client/tickets', {
        subject: formData.get('subject'),
        description: formData.get('description'),
        kind: formData.get('kind'),
      });
      setShowNewTicket(false);
      fetchTickets();
      form.reset();
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolvido':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'em processamento':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <MessageCircle size={16} className="text-blue-500" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suporte</h1>
          <p className="text-gray-500">Estamos aqui para ajudar o seu negócio a crescer.</p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} />
          Novo Ticket
        </button>
      </div>

      {/* Modal de novo ticket */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Novo Ticket de Suporte</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <input
                name="subject"
                placeholder="Assunto"
                className="w-full p-2 border rounded"
                required
              />
              <select name="kind" className="w-full p-2 border rounded">
                <option value="duvida">Dúvida</option>
                <option value="problema">Problema</option>
                <option value="sugestao">Sugestão</option>
              </select>
              <textarea
                name="description"
                placeholder="Descreva o seu problema ou dúvida..."
                className="w-full p-2 border rounded"
                rows={4}
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Criar Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de tickets */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Os Seus Tickets</h3>
        </div>
        <div className="divide-y">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum ticket encontrado.
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {getStatusIcon(ticket.status)}
                  <span className="text-xs font-medium uppercase text-gray-500">
                    {ticket.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.created_at).toLocaleDateString('pt-PT')}
                  </span>
                </div>
                <h4 className="font-medium mt-2">{ticket.subject}</h4>
                {ticket.kind && (
                  <span className="text-xs text-gray-500 mt-1 block">
                    {ticket.kind.toUpperCase()}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}