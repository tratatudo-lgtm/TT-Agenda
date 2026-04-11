import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../stores/useAuthStore';
import { LogIn, Send, CheckCircle2, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  code: z.string().length(6, 'O código deve ter 6 dígitos'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const handleSendOtp = async () => {
    console.log('Attempting to send OTP for phone:', phone);
    if (!phone || phone.length < 8) {
      toast.error('Por favor, insira um número de telefone válido');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const phone_e164 = `+${cleanPhone}`;
      console.log('Payload for send-otp:', { phone_e164 });
      
      const response = await api.post('/api/auth/send-otp', { phone_e164 });
      console.log('Send OTP response:', response.data);
      
      setStep('otp');
      toast.success('Código enviado para o seu WhatsApp!');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      const serverError = error.response?.data?.error || 'Erro ao enviar código';
      toast.error(serverError);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data: LoginForm) => {
    console.log('Attempting to verify OTP:', data.code);
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const phone_e164 = `+${cleanPhone}`;
      console.log('Payload for verify-otp:', { phone_e164, code: data.code });

      const response = await api.post('/api/auth/verify-otp', {
        phone_e164,
        code: data.code,
      });
      console.log('Verify OTP response:', response.data);
      
      setUser(response.data.client);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      const serverError = error.response?.data?.error || 'Código inválido';
      toast.error(serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <LogIn className="text-white" size={24} />
            </div>
            TT-Agenda
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-6xl font-bold leading-[0.9] tracking-tighter mb-6">
            GESTÃO DE<br />AGENDAMENTOS<br />PROFISSIONAL.
          </h1>
          <p className="text-slate-400 text-xl max-w-md">
            A plataforma SaaS multi-tenant definitiva para o seu negócio de serviços.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-slate-500">
          <span>© 2026 TT-Agenda</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
          <span>Privacidade</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
          <span>Termos</span>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-slate-900">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <LogIn className="text-white" size={24} />
              </div>
              TT-Agenda
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo de volta</h2>
            <p className="text-slate-500">
              {step === 'phone' 
                ? 'Insira o seu número de telefone para receber o código de acesso.' 
                : `Enviámos um código de 6 dígitos para +${phone}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.div
                key="phone-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Telemóvel
                  </label>
                  <PhoneInput
                    country={'pt'}
                    value={phone}
                    onChange={setPhone}
                    placeholder="912 345 678"
                    containerClass="!w-full"
                    inputClass="!w-full !h-12 !rounded-xl !border-slate-200 !text-lg"
                    buttonClass="!rounded-l-xl !border-slate-200 !bg-slate-50"
                  />
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {loading ? 'A enviar...' : 'Enviar Código'}
                  <Send size={20} />
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit(handleVerifyOtp)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Código de Verificação
                  </label>
                  <input
                    {...register('code')}
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 text-center text-2xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                  {errors.code && (
                    <p className="text-red-500 text-sm font-medium">{errors.code.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                  >
                    {loading ? 'A verificar...' : 'Verificar e Entrar'}
                    <CheckCircle2 size={20} />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-slate-500 font-medium hover:text-indigo-600 transition-colors flex items-center justify-center gap-1"
                  >
                    Alterar número de telefone
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-12 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                <ArrowRight className="text-indigo-600" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-indigo-900">Novo no TT-Agenda?</h4>
                <p className="text-sm text-indigo-700/80">
                  O registo é automático no primeiro login. Basta inserir o seu número e começar a gerir o seu negócio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
