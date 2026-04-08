import React, { useState } from 'react';
import api from '../lib/api';
import { Megaphone, Send, Users, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';

export default function Campaigns() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    
    setSending(true);
    try {
      await api.post('/campaigns/send', { message, customerIds: [] }); // Empty list for mock
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Campanhas</h2>
        <p className="text-gray-500 font-medium">Envie mensagens em massa para seus clientes via WhatsApp.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <form onSubmit={handleSend} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Mensagem da Campanha
                </label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Olá! Temos uma novidade para você..."
                  className="w-full bg-gray-50 border-none rounded-[24px] p-6 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  required
                />
                <p className="mt-3 text-xs text-gray-400 font-medium">
                  Dica: Use mensagens curtas e diretas para melhor engajamento.
                </p>
              </div>

              <button
                type="submit"
                disabled={sending || !message}
                className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                {sending ? <Loader2 className="animate-spin" size={20} /> : (sent ? <CheckCircle2 size={20} /> : <Send size={20} />)}
                {sending ? 'Enviando...' : (sent ? 'Campanha Enviada!' : 'Disparar Campanha')}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
              <Users size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Público Alvo</h4>
            <p className="text-sm font-medium text-gray-500 mb-6">Sua mensagem será enviada para todos os clientes cadastrados.</p>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-sm font-bold text-gray-900">Total de Clientes</span>
              <span className="text-lg font-black text-indigo-600">128</span>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-[32px] p-8 border border-indigo-100">
            <div className="flex items-center gap-3 mb-4 text-indigo-600">
              <MessageSquare size={20} />
              <h4 className="font-bold">Regras de Envio</h4>
            </div>
            <ul className="space-y-3">
              <li className="text-xs font-medium text-indigo-700 flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5" />
                Intervalo de 5s entre mensagens
              </li>
              <li className="text-xs font-medium text-indigo-700 flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5" />
                Limite de 500 envios por dia
              </li>
              <li className="text-xs font-medium text-indigo-700 flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5" />
                Evite links suspeitos
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
