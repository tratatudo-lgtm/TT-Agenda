import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Clock, Euro } from 'lucide-react';
import api from '../lib/api';

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
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/api/client/services');
      setServices(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-500">Configure os serviços que oferece.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">
          <Plus size={20} />
          Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center p-8">Carregando...</div>
        ) : services.length === 0 ? (
          <div className="col-span-full text-center p-8 text-gray-500">
            Nenhum serviço cadastrado.
          </div>
        ) : (
          services.map(service => (
            <div key={service.id} className="bg-white p-6 rounded-xl border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-lg">{service.name}</h3>
                <div className="flex gap-1">
                  <button className="p-1 text-gray-400 hover:text-indigo-600">
                    <Edit size={16} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {service.description && (
                <p className="text-gray-500 text-sm mb-4">{service.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock size={14} /> {service.duration} min
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Euro size={14} /> € {service.price?.toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}