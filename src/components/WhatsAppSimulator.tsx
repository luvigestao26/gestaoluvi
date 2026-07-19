"use client";

import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, X, CheckCheck, ExternalLink } from 'lucide-react';

interface WhatsAppSimulatorProps {
  message: string | null;
  phone: string | null;
  onClose: () => void;
}

export default function WhatsAppSimulator({ message, phone, onClose }: WhatsAppSimulatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
    }
  }, [message]);

  if (!message || !visible) return null;

  // Limpar o número de telefone para o link do WhatsApp
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  // Adicionar código do país (55 para Brasil) se não tiver
  const formattedPhone = cleanPhone.length === 11 || cleanPhone.length === 10 
    ? `55${cleanPhone}` 
    : cleanPhone;

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;

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
            <p className="text-[10px] text-emerald-100">Envio automático para o cliente</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setVisible(false);
            onClose();
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

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
          >
            <ExternalLink size={14} />
            Enviar no WhatsApp do Cliente
          </a>
          
          <button
            onClick={() => {
              setVisible(false);
              onClose();
            }}
            className="w-full bg-white hover:bg-slate-50 text-slate-600 font-semibold py-2 px-4 rounded-xl text-xs border border-slate-200 transition-all"
          >
            Fechar Notificação
          </button>
        </div>
      </div>
    </div>
  );
}