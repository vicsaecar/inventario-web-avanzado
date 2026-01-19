
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles, Database, PieChart } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { InventoryItem } from '../types';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, inventory }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Soy el consultor senior de IT de Zubi Group. Analizo el inventario en tiempo real. ¿Necesitas un reporte de valorización, auditoría de responsables o búsqueda específica?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (messageText: string = input) => {
    const textToSend = messageText.trim();
    if (!textToSend || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      // Create a new instance right before making an API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Contexto enriquecido para razonamiento complejo
      // Fix: Properties changed to uppercase as per InventoryItem definition
      const context = JSON.stringify(inventory.map(i => ({ 
        id: i.CODIGO, n: i.EQUIPO, e: i.EMPRESA, r: i.ASIGNADO, l: i.UBICACION, s: i.ESTADO, c: i.COSTE, t: i.TIPO
      })));

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Escalado a PRO para razonamiento avanzado
        contents: `Sistema Zubi Inv. Datos: ${context}. Usuario: ${textToSend}. Responde como un Director de IT. Realiza cálculos si es necesario (sumas de costes, conteos de estados). Máximo 200 palabras.`,
      });

      // Using the property .text directly as per guidelines
      setMessages(prev => [...prev, { role: 'ai', text: response.text || 'Sin respuesta.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error en el núcleo de razonamiento. Intente simplificar la consulta.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-50 flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-100">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight">Consultor IT Avanzado</h3>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gemini 3 Pro Engine</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-4 rounded-3xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'}`}>
              <div className={`flex items-center gap-2 mb-2 opacity-60 text-[10px] uppercase font-bold tracking-widest ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                {msg.role === 'user' ? 'Operador' : 'IT Consultant'}
              </div>
              <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center gap-4 shadow-sm animate-pulse">
              <Loader2 className="animate-spin text-blue-600" size={18} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Auditando registros...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="grid grid-cols-2 gap-2 mb-4">
           <button onClick={() => handleSend("¿Cuál es el valor total por empresa?")} className="text-[10px] font-bold p-2 bg-slate-50 border rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2">
              <PieChart size={12}/> Valor por Empresa
           </button>
           <button onClick={() => handleSend("Listado de equipos sin responsable")} className="text-[10px] font-bold p-2 bg-slate-50 border rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2">
              <Database size={12}/> Auditoría Dueños
           </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Analizar inventario..."
            className="flex-1 bg-slate-100 border-transparent border focus:border-blue-500 rounded-2xl px-5 py-4 text-sm focus:bg-white outline-none transition-all pr-14 font-medium"
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
