import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { 
  Plus, 
  Scissors, 
  Clock, 
  DollarSign, 
  MoreVertical, 
  Loader2,
  Tag,
  Settings2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (err) {
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Serviços</h2>
          <p className="text-gray-500 font-medium">Configure seu catálogo de serviços e preços.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          <Plus size={20} />
          Novo Serviço
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-56 bg-white rounded-[32px] border border-gray-100 animate-pulse" />)
        ) : services.length === 0 ? (
          <div className="col-span-full p-20 text-center bg-white rounded-[32px] border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Scissors size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-gray-500 font-medium">Adicione os serviços que você oferece aos seus clientes.</p>
          </div>
        ) : services.map((service) => (
          <div key={service.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Scissors size={24} />
                </div>
                <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
              <div className="flex items-center gap-2 text-gray-400 mb-8">
                <Tag size={14} />
                <span className="text-xs font-bold uppercase tracking-widest">Categoria Geral</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Clock size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Duração</span>
                  </div>
                  <p className="text-sm font-black text-gray-900">45 min</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <DollarSign size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Preço</span>
                  </div>
                  <p className="text-sm font-black text-indigo-600">R$ 85,00</p>
                </div>
              </div>

              <button className="w-full py-3 text-xs font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                <Settings2 size={14} />
                Configurar Serviço
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
