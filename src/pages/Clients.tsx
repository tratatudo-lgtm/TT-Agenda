import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import api from '../lib/api';

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/api/client/customers');
      setClients(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">Gerencie a sua base de clientes.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Pesquisar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 font-medium text-gray-500">Nome</th>
              <th className="text-left p-4 font-medium text-gray-500">Telefone</th>
              <th className="text-left p-4 font-medium text-gray-500">Email</th>
              <th className="text-right p-4 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center">Carregando...</td></tr>
            ) : filteredClients.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nenhum cliente encontrado.</td></tr>
            ) : (
              filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{client.name}</td>
                  <td className="p-4 text-gray-500">{client.phone || '-'}</td>
                  <td className="p-4 text-gray-500">{client.email || '-'}</td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-indigo-600">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}