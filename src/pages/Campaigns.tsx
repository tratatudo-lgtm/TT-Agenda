import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Megaphone, Plus, Send, Trash2, Users } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  message: string;
  status: 'draft' | 'sent';
  targetCount: number;
  createdAt: string;
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const response = await api.get('/v1/campaigns');
        setCampaigns(response.data);
      } catch (error) {
        console.error('Error loading campaigns', error);
      } finally {
        setLoading(false);
      }
    }
    loadCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campanhas</h2>
          <p className="text-gray-500">Envie mensagens em massa para os seus clientes.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          <Plus size={20} />
          Nova Campanha
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Carregando...</div>
        ) : campaigns.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-gray-100">
            <Megaphone size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Sem campanhas</h3>
            <p className="text-gray-500 mt-1">Crie a sua primeira campanha de marketing.</p>
          </div>
        ) : (
          campaigns.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                  <Megaphone size={24} />
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {c.status === 'sent' ? 'Enviada' : 'Rascunho'}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{c.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-3 mb-4">{c.message}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users size={14} />
                  {c.targetCount} clientes
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                  {c.status === 'draft' && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                      <Send size={14} />
                      Enviar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
