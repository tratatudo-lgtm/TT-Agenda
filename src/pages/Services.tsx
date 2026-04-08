import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Scissors, Clock, DollarSign, MoreVertical } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/services')
      .then(res => setServices(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Serviços</h2>
          <p className="text-gray-500 font-medium">Configure seu catálogo de serviços.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
          <Plus size={20} />
          Novo Serviço
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-[24px] border border-gray-100 animate-pulse" />)
        ) : services.map((service) => (
          <div key={service.id} className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6">
              <Scissors size={28} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
            <p className="text-sm font-medium text-gray-400 mb-6 line-clamp-2">{service.description || 'Sem descrição definida.'}</p>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-900">{service.duration} min</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-gray-400" />
                <span className="text-sm font-black text-indigo-600">R$ {service.price}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50">
              <button className="w-full py-3 text-sm font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                Editar Configurações
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
