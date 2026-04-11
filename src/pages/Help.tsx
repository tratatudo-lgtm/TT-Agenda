import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  MessageSquare, 
  BookOpen, 
  PlayCircle,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const faqs = [
  {
    question: 'Como posso alterar o meu horário de funcionamento?',
    answer: 'Pode alterar o seu horário em Definições > Horário de Funcionamento. Lá pode definir as horas de abertura e fecho para cada dia da semana, bem como marcar dias como encerrados.'
  },
  {
    question: 'Como funciona o sistema de notificações?',
    answer: 'O TT-Agenda envia notificações automáticas para os seus clientes via WhatsApp (se ativado) para confirmar agendamentos e enviar lembretes 24h antes da marcação.'
  },
  {
    question: 'Posso exportar a minha lista de clientes?',
    answer: 'Sim! Na página de Clientes, clique no botão "Exportar CSV" para descarregar um ficheiro com todos os dados dos seus clientes.'
  },
  {
    question: 'Como gerir a minha equipa?',
    answer: 'No plano Profissional, pode adicionar até 3 funcionários em Definições > Equipa. Cada funcionário pode ter a sua própria cor na agenda para facilitar a visualização.'
  },
  {
    question: 'Como cancelar uma assinatura?',
    answer: 'Aceda a Definições > Plano Atual e clique em "Gerir Assinatura". Será redirecionado para o portal de faturação do Stripe onde poderá cancelar ou alterar o seu plano.'
  }
];

const FAQItem = ({ faq }: { faq: typeof faqs[0] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {faq.question}
        </span>
        <div className={`p-2 rounded-lg transition-all ${isOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-500 font-medium leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Help() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-flex p-3 bg-indigo-50 rounded-2xl text-indigo-600 mb-2">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Como podemos ajudar?</h1>
        <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
          Encontre respostas rápidas para as suas dúvidas ou entre em contacto com a nossa equipa de suporte.
        </p>
      </header>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a 
          href="https://docs.ttagenda.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group"
        >
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Documentação</h3>
          <p className="text-slate-500 text-sm font-medium mb-4">Guias detalhados sobre todas as funcionalidades.</p>
          <span className="text-indigo-600 font-bold text-sm flex items-center gap-1">
            Ler mais <ExternalLink size={14} />
          </span>
        </a>

        <a 
          href="https://youtube.com/ttagenda" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:border-rose-200 transition-all group"
        >
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform">
            <PlayCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Tutoriais Vídeo</h3>
          <p className="text-slate-500 text-sm font-medium mb-4">Aprenda a configurar a sua conta em poucos minutos.</p>
          <span className="text-rose-600 font-bold text-sm flex items-center gap-1">
            Ver vídeos <ExternalLink size={14} />
          </span>
        </a>

        <div 
          onClick={() => navigate('/support')}
          className="bg-slate-900 p-8 rounded-[32px] shadow-xl shadow-slate-200 cursor-pointer group"
        >
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Suporte Direto</h3>
          <p className="text-slate-400 text-sm font-medium mb-4">Fale com um especialista para resolver problemas técnicos.</p>
          <button className="text-white font-bold text-sm flex items-center gap-1">
            Abrir Ticket <Plus size={14} />
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-900">Perguntas Frequentes</h2>
          <p className="text-slate-500 font-medium">Respostas rápidas para as dúvidas mais comuns.</p>
        </div>
        <div className="px-10">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} />
          ))}
        </div>
        <div className="p-10 bg-slate-50/50 text-center">
          <p className="text-slate-500 font-medium mb-4">Não encontrou o que procurava?</p>
          <button 
            onClick={() => navigate('/support')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Contactar Suporte
          </button>
        </div>
      </div>
    </div>
  );
}
