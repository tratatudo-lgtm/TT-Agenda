import React, { useEffect, useState } from 'react';
import { 
  LifeBuoy, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X,
  Loader2,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import { Ticket } from '../types';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ticketSchema = z.object({
  subject: z.string().min(5, 'Assunto deve ter pelo menos 5 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category: z.string().min(1, 'Selecione uma categoria'),
});

type TicketForm = z.infer<typeof ticketSchema>;

const statusMap = {
  open: { label: 'Aberto', color: 'bg-amber-50 text-amber-600', icon: AlertCircle },
  in_progress: { label: 'Em Processamento', color: 'bg-indigo-50 text-indigo-600', icon: Clock },
  closed: { label: 'Resolvido', color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
};

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
  });

  const fetchTickets = async () => {
    try {
      const response = await api.get('/api/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // Mock tickets for demo
      setTickets([
        { 
          id: '1', 
          subject: 'Dúvida sobre lembretes WhatsApp', 
          description: 'Como configurar o tempo de antecedência?', 
          category: 'Funcionalidades', 
          status: 'closed', 
          created_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          subject: 'Erro ao carregar agenda no telemóvel', 
          description: 'A página fica branca às vezes.', 
          category: 'Bug', 
          status: 'in_progress', 
          created_at: new Date().toISOString() 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const onSubmit = async (data: TicketForm) => {
    setSubmitting(true);
    try {
      await api.post('/api/tickets', data);
      toast.success('Ticket criado com sucesso! Entraremos em contacto brevemente.');
      setIsModalOpen(false);
      reset();
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Suporte</h2>
          <p className="text-slate-500 font-medium">Estamos aqui para ajudar o seu negócio a crescer.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          Novo Ticket
        </button>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Tickets List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Os Seus Tickets</h3>
          
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Carregando tickets...</div>
            ) : tickets.length > 0 ? (
              tickets.map((ticket) => {
                const status = statusMap[ticket.status];
                return (
                  <motion.div 
                    key={ticket.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-indigo-200 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${status.color}`}>
                        <status.icon size={12} />
                        {status.label}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {format(new Date(ticket.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{ticket.subject}</h4>
                    <p className="text-slate-500 text-sm line-clamp-2 font-medium mb-4">{ticket.description}</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <MessageSquare size={14} />
                      {ticket.category}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-white p-12 rounded-[32px] border border-slate-200 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <LifeBuoy size={32} />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Sem tickets ativos</h4>
                <p className="text-slate-500 text-sm">Se tiver alguma dúvida ou problema, crie um novo ticket.</p>
              </div>
            )}
          </div>
        </div>

        {/* FAQ & Quick Help */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Perguntas Frequentes</h3>
            <div className="space-y-6">
              {[
                { q: 'Como alterar o meu plano?', a: 'Vá às Definições > Assinatura e clique em Gerir.' },
                { q: 'Posso ter múltiplos funcionários?', a: 'Sim, o plano Profissional permite até 5 funcionários.' },
                { q: 'Como exportar os meus dados?', a: 'Pode exportar a lista de clientes em formato CSV nas Definições.' },
              ].map((faq, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">{faq.q}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 text-white p-8 rounded-[32px] shadow-lg shadow-indigo-100">
            <h3 className="text-xl font-bold mb-2">Centro de Ajuda</h3>
            <p className="text-indigo-100 text-sm mb-6 font-medium">Aceda à nossa documentação completa e tutoriais em vídeo.</p>
            <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all">
              Visitar Documentação
            </button>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
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
                <h3 className="text-2xl font-bold text-slate-900">Novo Ticket</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Categoria</label>
                  <select 
                    {...register('category')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Selecione uma categoria...</option>
                    <option value="Funcionalidades">Funcionalidades</option>
                    <option value="Faturação">Faturação / Pagamentos</option>
                    <option value="Bug">Reportar um Erro</option>
                    <option value="Outro">Outro</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-xs font-bold">{errors.category.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Assunto</label>
                  <input 
                    {...register('subject')}
                    type="text" 
                    placeholder="Resuma o seu problema ou dúvida"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  {errors.subject && <p className="text-red-500 text-xs font-bold">{errors.subject.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Descrição Detalhada</label>
                  <textarea 
                    {...register('description')}
                    rows={4}
                    placeholder="Explique detalhadamente como podemos ajudar..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                  {errors.description && <p className="text-red-500 text-xs font-bold">{errors.description.message}</p>}
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
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Enviar Ticket</>}
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
