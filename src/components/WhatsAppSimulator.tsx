"use client";

import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, X, CheckCheck } from 'lucide-react';

interface WhatsAppSimulatorProps {
  message: string | null;
  onClose: () => void;
}

export default function WhatsAppSimulator({ message, onClose }: WhatsAppSimulatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // wait for fade out animation
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message || !visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-white/20 p-1.5 rounded-full">
            <MessageSquare size={18} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Notificação WhatsApp</h4>
            <p className="text-[10px] text-emerald-100">Simulação de envio automático</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 bg-[#efeae2] relative min-h-[120px] flex flex-col justify-between">
        {/* Chat Bubble */}
        <div className="bg-white rounded-xl p-3 shadow-sm text-slate-800 text-xs relative self-start max-w-[90%] rounded-tl-none">
          <div className="absolute left-0 top-0 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent -translate-x-2" />
          <p className="whitespace-pre-line leading-relaxed">{message}</p>
          <div className="flex justify-end items-center gap-1 mt-1.5 text-[9px] text-slate-400">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <CheckCheck size={12} className="text-blue-500" />
          </div>
        </div>

        {/* Footer Status */}
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg self-stretch justify-center">
          <Send size={12} />
          <span>Mensagem enviada com sucesso para o cliente!</span>
        </div>
      </div>
    </div>
  );
}