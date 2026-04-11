import React, { useEffect, useState } from 'react';
import { 
  Scissors, 
  Plus, 
  Clock, 
  Euro, 
  MoreVertical, 
  Search,
  X,
  Loader2,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import { Service } from '../types';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  duration_minutes: z.number().min(5, 'Duração mínima é 5 minutos'),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  description: z.string().optional(),
});

type ServiceForm = z.infer<typeof serviceSchema>;

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      duration_minutes: 30,
      price: 0,
    }
  });

  const fetchServices = async () => {
    try {
      const response = await api.get('/api/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const onSubmit = async (data: ServiceForm) => {
    setSubmitting(true);
    try {
      await api.post('/api/services', data);
      toast.success('Serviço adicionado com sucesso!');
      setIsModalOpen(false);
      reset();
      fetchServices();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao adicionar serviço');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Serviços</h2>
          <p className="text-slate-500 font-medium">Configure o seu menu de serviços e preços.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          Novo Serviço
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200 animate-pulse h-64"></div>
          ))
        ) : services.length > 0 ? (
          services.map((service) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                  <Scissors size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <Edit2 size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-medium">
                  {service.description || 'Sem descrição disponível.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 font-bold">
                  <Clock size={18} className="text-slate-400" />
                  {service.duration_minutes} min
                </div>
                <div className="text-2xl font-black text-slate-900">
                  € {service.price.toFixed(2)}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Scissors size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum serviço configurado</h3>
            <p className="text-slate-500 font-medium">Adicione os seus serviços para começar a receber agendamentos.</p>
          </div>
        )}
      </div>

      {/* Add Service Modal */}
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
                <h3 className="text-2xl font-bold text-slate-900">Novo Serviço</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Nome do Serviço</label>
                  <input 
                    {...register('name')}
                    type="text" 
                    placeholder="Ex: Corte de Cabelo Masculino"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Duração (minutos)</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        {...register('duration_minutes', { valueAsNumber: true })}
                        type="number" 
                        step="5"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    {errors.duration_minutes && <p className="text-red-500 text-xs font-bold">{errors.duration_minutes.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Preço (€)</label>
                    <div className="relative">
                      <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        {...register('price', { valueAsNumber: true })}
                        type="number" 
                        step="0.01"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    {errors.price && <p className="text-red-500 text-xs font-bold">{errors.price.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Descrição</label>
                  <textarea 
                    {...register('description')}
                    rows={3}
                    placeholder="Descreva o que está incluído no serviço..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
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
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Guardar Serviço'}
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
