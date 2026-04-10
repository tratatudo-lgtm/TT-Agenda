import React, { useState } from 'react';
import { 
  Megaphone, 
  Send, 
  Users, 
  MessageSquare, 
  Loader2, 
  CheckCircle2,
  History,
  TrendingUp,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Campaigns() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    
    setSending(true);
    try {
      // Mocking campaign send since there's no real backend endpoint for this yet
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Campanha disparada com sucesso!');
      setMessage('');
    } catch (err) {
      toast.error('Erro ao disparar campanha');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Campanhas</h2>
        <p className="text-gray-500 font-medium">Envie mensagens em massa e fidelize seus clientes.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[32px] p-8 lg:p-10 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Nova Campanha</h3>
                <p className="text-sm font-medium text-gray-400">Escreva a mensagem que será enviada via WhatsApp.</p>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-8">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Conteúdo da Mensagem
                </label>
                <div className="relative">
                  <textarea
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Olá! Temos uma novidade especial para você..."
                    className="w-full bg-gray-50 border-none rounded-[24px] p-8 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 transition-all resize-none placeholder-gray-300"
                    required
                  />
                  <div className="absolute bottom-6 right-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    {message.length} caracteres
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setMessage(m => m + '{nome_cliente}')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-bold text-gray-500 transition-colors">
                    + Nome do Cliente
                  </button>
                  <button type="button" onClick={() => setMessage(m => m + '{link_agenda}')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-bold text-gray-500 transition-colors">
                    + Link da Agenda
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={sending || !message}
                className="w-full bg-indigo-600 text-white rounded-2xl py-5 font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Disparar Campanha Agora
                    <Send size={20} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History size={20} className="text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900">Histórico Recente</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {[1, 2].map((i) => (
                <div key={i} className="p-8 flex items-center gap-6 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 mb-1">Promoção de Verão</p>
                    <p className="text-xs font-medium text-gray-400 line-clamp-1">Olá! Aproveite 20% de desconto em todos os serviços...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">128 envios</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">10 Abr, 2026</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
              <Target size={24} />
            </div>
            <h4 className="text-xl font-bold mb-2">Público Alvo</h4>
            <p className="text-indigo-100 text-sm font-medium mb-8">Sua mensagem será enviada para todos os clientes ativos na sua base.</p>
            <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Total de Clientes</p>
              <p className="text-3xl font-black">1.248</p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={20} className="text-indigo-600" />
              <h4 className="font-bold text-gray-900">Dicas de Sucesso</h4>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <p className="text-sm font-medium text-gray-600">Seja direto e ofereça um benefício claro.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <p className="text-sm font-medium text-gray-600">Use o nome do cliente para aumentar a conversão.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <p className="text-sm font-medium text-gray-600">Evite enviar muitas mensagens seguidas.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
