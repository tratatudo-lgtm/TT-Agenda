import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Scissors, 
  Clock, 
  Euro, 
  Edit2, 
  Trash2,
  Tag
} from 'lucide-react';
import { formatCurrency } from '../utils';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const response = await api.get('/v1/services');
        setServices(response.data);
      } catch (error) {
        console.error('Error loading services', error);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Serviços</h2>
          <p className="text-gray-500">Configure os serviços que o seu negócio oferece.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          <Plus size={20} />
          Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse h-40" />
          ))
        ) : services.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-gray-100">
            <Scissors size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Nenhum serviço</h3>
            <p className="text-gray-500 mt-1">Adicione os serviços que os seus clientes podem agendar.</p>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                  <Scissors size={24} />
                </div>
                <div className="flex gap-1">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded tracking-wider">
                    {service.category}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    {service.duration} min
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-600">
                    <Euro size={16} />
                    {formatCurrency(service.price)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
