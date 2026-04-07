import { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Plus, 
  Search, 
  User, 
  Mail, 
  Phone, 
  MoreVertical,
  Trash2,
  Edit2
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalAppointments: number;
  lastVisit: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadClients() {
      try {
        const response = await api.get('/v1/clients');
        setClients(response.data);
      } catch (error) {
        console.error('Error loading clients', error);
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-500">Base de dados de clientes e histórico.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Procurar por nome, email ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse h-48" />
          ))
        ) : clients.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-gray-100">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Nenhum cliente encontrado</h3>
            <p className="text-gray-500 mt-1">Comece por adicionar o seu primeiro cliente.</p>
          </div>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {client.name.charAt(0)}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="font-bold text-gray-900 text-lg truncate">{client.name}</h3>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail size={14} />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone size={14} />
                  <span>{client.phone}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Visitas</p>
                  <p className="text-sm font-bold text-gray-900">{client.totalAppointments}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Última</p>
                  <p className="text-sm font-bold text-gray-900">{client.lastVisit ? new Date(client.lastVisit).toLocaleDateString() : '---'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
