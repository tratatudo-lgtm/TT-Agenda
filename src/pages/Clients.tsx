import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { 
  Plus, 
  Search, 
  User, 
  Users,
  Phone, 
  Mail, 
  MoreVertical, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  phone_e164: string;
  email?: string;
}

export default function Clients() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (err) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone_e164.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Clientes</h2>
          <p className="text-gray-500 font-medium">Gerencie sua base de contatos e histórico.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          <Plus size={20} />
          Novo Cliente
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-white rounded-[32px] border border-gray-100 animate-pulse" />)
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full p-20 text-center bg-white rounded-[32px] border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Users size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum cliente encontrado</h3>
            <p className="text-gray-500 font-medium">Comece adicionando seu primeiro cliente ao sistema.</p>
          </div>
        ) : filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
            <div className="absolute top-6 right-6">
              <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl">
                {customer.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">{customer.name}</h3>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Ativo</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Phone size={14} />
                </div>
                <span className="text-sm font-bold text-gray-700">{customer.phone_e164}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Mail size={14} />
                </div>
                <span className="text-sm font-bold text-gray-700 truncate">{customer.email || 'Não informado'}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-3 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                Ver Perfil
                <ExternalLink size={14} />
              </button>
              <button className="flex-1 py-3 text-xs font-bold text-gray-400 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
