import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, KeyRound, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';

export default function LoginOTP() {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/otp/send', { phone });
      setStep('code');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao enviar código. Verifique o número.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/otp/verify', { contact: phone, code });
      login({ phone, authenticated: true });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <h1 className="text-4xl font-bold text-indigo-600 text-center mb-2">TrataTudo</h1>
        <p className="text-gray-500 text-center mb-8">
          {step === 'phone' ? 'Faça login com o seu número de telefone' : 'Digite o código recebido'}
        </p>

        {step === 'phone' ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Número de Telefone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="+351 912 345 678"
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Enviar Código'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Código de Verificação
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Digite o código de 6 dígitos"
                  maxLength={6}
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verificar Código'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          &copy; 2026 TrataTudo Agenda. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  );
}