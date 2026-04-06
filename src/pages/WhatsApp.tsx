import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  MessageSquare, 
  Send, 
  Search, 
  CheckCheck,
  Phone
} from 'lucide-react';

interface Conversation {
  id: string;
  clientName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export default function WhatsApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadConversations() {
      try {
        const response = await api.get('/v1/whatsapp/conversations');
        setConversations(response.data);
      } catch (error) {
        console.error('Error loading conversations', error);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !selectedId) return;

    try {
      await api.post('/v1/whatsapp/send', {
        conversationId: selectedId,
        message
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="w-full sm:w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Procurar conversa..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="p-4 text-center text-gray-400 text-sm">Carregando...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Sem conversas ativas.</div>
          ) : conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${selectedId === c.id ? 'bg-indigo-50' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                {c.clientName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-900 truncate">{c.clientName}</span>
                  <span className="text-[10px] text-gray-400">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden sm:flex flex-1 flex-col bg-gray-50">
        {selectedId ? (
          <>
            <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {conversations.find(c => c.id === selectedId)?.clientName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{conversations.find(c => c.id === selectedId)?.clientName}</p>
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">Online</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                <Phone size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex justify-start">
                <div className="max-w-[70%] bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-800">Olá! Gostaria de confirmar o meu agendamento.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva uma mensagem..."
                  className="flex-1 bg-gray-100 border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
                <button type="submit" className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare size={40} className="text-indigo-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Selecione uma conversa</h3>
          </div>
        )}
      </div>
    </div>
  );
}
