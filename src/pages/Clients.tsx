import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Search, User, Phone, Mail, MoreVertical } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export default function Clients() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/customers')
      .then(res => setCustomers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Clientes</h2>
          <p className="text-gray-500 font-medium">Gerencie sua base de contatos.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
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
          [1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-white rounded-[24px] border border-gray-100 animate-pulse" />)
        ) : filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                {customer.name[0]}
              </div>
              <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-4">{customer.name}</h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Phone size={14} />
                <span className="text-sm font-medium">{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Mail size={14} />
                  <span className="text-sm font-medium truncate">{customer.email}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 flex gap-2">
              <button className="flex-1 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                Ver Histórico
              </button>
              <button className="flex-1 py-2 text-xs font-bold text-gray-400 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
