import React from 'react';
import { X, Loader2, Palette, User, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Staff } from '../types';

const staffSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone_e164: z.string().min(9, 'Telefone inválido'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida'),
});

type StaffForm = z.infer<typeof staffSchema>;

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StaffForm) => Promise<void>;
  initialData: Staff | null;
  submitting: boolean;
}

const colors = [
  '#4f46e5', // Indigo
  '#0891b2', // Cyan
  '#059669', // Emerald
  '#d97706', // Amber
  '#e11d48', // Rose
  '#7c3aed', // Violet
  '#2563eb', // Blue
  '#db2777', // Pink
];

export default function StaffModal({ isOpen, onClose, onSubmit, initialData, submitting }: StaffModalProps) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<StaffForm>({
    resolver: zodResolver(staffSchema),
    defaultValues: initialData || { color: colors[0] }
  });

  React.useEffect(() => {
    if (isOpen) {
      reset(initialData || { color: colors[0] });
    }
  }, [isOpen, initialData, reset]);

  const selectedColor = watch('color');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">
                {initialData ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <User size={16} /> Nome
                </label>
                <input 
                  {...register('name')}
                  type="text" 
                  placeholder="Nome do funcionário"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={16} /> Email
                </label>
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="email@empresa.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                {errors.email && <p className="text-red-500 text-xs font-bold">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <User size={16} /> Telefone
                </label>
                <input 
                  {...register('phone_e164')}
                  type="text" 
                  placeholder="+351912345678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                {errors.phone_e164 && <p className="text-red-500 text-xs font-bold">{errors.phone_e164.message}</p>}
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <Palette size={16} /> Cor na Agenda
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('color', color)}
                      className={`h-12 rounded-xl border-4 transition-all ${selectedColor === color ? 'border-slate-900 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {errors.color && <p className="text-red-500 text-xs font-bold">{errors.color.message}</p>}
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Guardar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
