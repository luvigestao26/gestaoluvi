"use client";

import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SplitPaymentInputProps {
  totalPrice: number;
  onChange: (paymentMethodString: string) => void;
}

export default function SplitPaymentInput({ totalPrice, onChange }: SplitPaymentInputProps) {
  const [pix, setPix] = useState<string>("");
  const [dinheiro, setDinheiro] = useState<string>("");
  const [credito, setCredito] = useState<string>("");
  const [debito, setDebito] = useState<string>("");

  const valPix = parseFloat(pix) || 0;
  const valDinheiro = parseFloat(dinheiro) || 0;
  const valCredito = parseFloat(credito) || 0;
  const valDebito = parseFloat(debito) || 0;

  const currentTotal = valPix + valDinheiro + valCredito + valDebito;
  const remaining = totalPrice - currentTotal;

  useEffect(() => {
    const parts: string[] = [];
    if (valPix > 0) parts.push(`Pix: R$ ${valPix.toFixed(2)}`);
    if (valDinheiro > 0) parts.push(`Dinheiro: R$ ${valDinheiro.toFixed(2)}`);
    if (valCredito > 0) parts.push(`Crédito: R$ ${valCredito.toFixed(2)}`);
    if (valDebito > 0) parts.push(`Débito: R$ ${valDebito.toFixed(2)}`);

    if (parts.length > 0) {
      onChange(`Dividido (${parts.join(', ')})`);
    } else {
      onChange("Dividido");
    }
  }, [pix, dinheiro, credito, debito, onChange]);

  return (
    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 animate-in fade-in duration-200">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-slate-400">Total a dividir:</span>
        <span className="text-white">R$ {totalPrice.toFixed(2)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[11px] text-slate-400">Pix (R$)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={pix}
            onChange={(e) => setPix(e.target.value)}
            className="h-9 rounded-xl border-slate-800 bg-slate-900 text-white text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-slate-400">Dinheiro (R$)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={dinheiro}
            onChange={(e) => setDinheiro(e.target.value)}
            className="h-9 rounded-xl border-slate-800 bg-slate-900 text-white text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-slate-400">C. Crédito (R$)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={credito}
            onChange={(e) => setCredito(e.target.value)}
            className="h-9 rounded-xl border-slate-800 bg-slate-900 text-white text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-slate-400">C. Débito (R$)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={debito}
            onChange={(e) => setDebito(e.target.value)}
            className="h-9 rounded-xl border-slate-800 bg-slate-900 text-white text-xs"
          />
        </div>
      </div>

      <div className="flex justify-between items-center text-[11px] font-bold pt-1 border-t border-slate-900">
        <span className="text-slate-400">Soma informada:</span>
        <span className={Math.abs(remaining) < 0.01 ? "text-emerald-400" : "text-amber-400"}>
          R$ {currentTotal.toFixed(2)}
        </span>
      </div>

      {remaining !== 0 && (
        <div className="text-[10px] text-amber-400 font-semibold text-center">
          {remaining > 0 
            ? `Faltam R$ ${remaining.toFixed(2)} para completar o total.`
            : `Valor ultrapassa o total em R$ ${Math.abs(remaining).toFixed(2)}.`}
        </div>
      )}
    </div>
  );
}