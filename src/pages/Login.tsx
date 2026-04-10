import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone });
      setStep('code');
      toast.success('Código enviado via WhatsApp!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(phone, code);
      toast.success('Bem-vindo ao TT-Agenda!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-indigo-600 tracking-tighter mb-2">TT-AGENDA</h1>
          <p className="text-gray-500 font-medium">Gestão inteligente para o seu negócio</p>
        </div>

        <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-sm border border-gray-100">
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.form
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Seu WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      placeholder="5511999999999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      Enviar Código
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="code"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Código de 6 dígitos
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-medium tracking-[1em] text-center focus:ring-2 focus:ring-indigo-500 transition-all"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verificar Código'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Voltar e alterar número
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-8 text-sm text-gray-400 font-medium">
          Ao entrar, você concorda com nossos termos de uso.
        </p>
      </div>
    </div>
  );
}
