import { useEffect, useState } from 'react';
import api from '../services/api';
import { Bot, Save, Loader2, MessageSquare, Settings } from 'lucide-react';

interface BotConfig {
  enabled: boolean;
  welcomeMessage: string;
  autoReply: boolean;
  aiTone: 'professional' | 'friendly' | 'casual';
}

export default function BotConfig() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await api.get('/v1/bot/config');
        setConfig(response.data);
      } catch (error) {
        console.error('Error loading bot config', error);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await api.put('/v1/bot/config', config);
    } catch (error) {
      console.error('Error saving bot config', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuração do Bot</h2>
          <p className="text-gray-500">Personalize como o assistente virtual interage com os seus clientes.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Guardar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Estado do Bot</h3>
                  <p className="text-xs text-gray-500">Ativar ou desativar o assistente virtual.</p>
                </div>
              </div>
              <button
                onClick={() => setConfig(prev => prev ? { ...prev, enabled: !prev.enabled } : null)}
                className={`w-12 h-6 rounded-full transition-colors relative ${config?.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config?.enabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Mensagem de Boas-vindas</label>
              <textarea
                value={config?.welcomeMessage}
                onChange={(e) => setConfig(prev => prev ? { ...prev, welcomeMessage: e.target.value } : null)}
                rows={4}
                className="w-full p-4 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                placeholder="Olá! Como posso ajudar hoje?"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Tom de Voz da IA</label>
              <div className="grid grid-cols-3 gap-4">
                {['professional', 'friendly', 'casual'].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setConfig(prev => prev ? { ...prev, aiTone: tone as any } : null)}
                    className={`py-2 px-4 rounded-lg text-xs font-bold capitalize transition-all ${config?.aiTone === tone ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {tone === 'professional' ? 'Profissional' : tone === 'friendly' ? 'Amigável' : 'Casual'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
              <MessageSquare size={18} />
              Dica de Expert
            </h4>
            <p className="text-sm text-indigo-700 leading-relaxed">
              Um tom de voz <strong>Amigável</strong> costuma ter melhores taxas de conversão para barbearias e spas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Settings size={18} className="text-gray-400" />
              Opções Avançadas
            </h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Resposta Automática</span>
              <button
                onClick={() => setConfig(prev => prev ? { ...prev, autoReply: !prev.autoReply } : null)}
                className={`w-10 h-5 rounded-full transition-colors relative ${config?.autoReply ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${config?.autoReply ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
