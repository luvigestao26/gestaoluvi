"use client";

import React, { useState } from 'react';
import { Plus, Trash2, ShoppingCart, DollarSign, Tag, Calendar, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";

interface VendasManagementProps {
  sales: any[];
  products: any[];
  onAddSale: (sale: any) => void;
  onDeleteSale: (id: string) => void;
}

export default function VendasManagement({ sales, products, onAddSale, onDeleteSale }: VendasManagementProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [customerName, setCustomerName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !quantity) {
      showError("Por favor, selecione o produto e a quantidade.");
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      showError("Produto não encontrado.");
      return;
    }

    const qty = parseInt(quantity);
    if (product.quantity < qty) {
      showError(`Estoque insuficiente! Apenas ${product.quantity} unidades disponíveis.`);
      return;
    }

    const total = product.salePrice * qty;

    const newSale = {
      id: Date.now().toString(),
      productId,
      productName: product.name,
      quantity: qty,
      total,
      paymentMethod,
      customerName: customerName || "Consumidor Final",
      date: new Date().toISOString().split('T')[0]
    };

    onAddSale(newSale);
    showSuccess("Venda registrada com sucesso!");

    // Reset
    setProductId("");
    setQuantity("1");
    setCustomerName("");
    setIsOpen(false);
  };

  const totalSalesAmount = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas (Hoje)</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">R$ {totalSalesAmount.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">{sales.length} vendas realizadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Registro de Vendas</h2>
          <p className="text-sm text-slate-500">Lance vendas de bebidas, lanches e acessórios diretamente no caixa</p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2"
        >
          <Plus size={18} />
          Nova Venda
        </Button>
      </div>

      {/* Sales Table */}
      <Card className="border-none shadow-md bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Produto</th>
                  <th className="p-4">Qtd</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Pagamento</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{sale.productName}</td>
                    <td className="p-4 text-slate-600">{sale.quantity}x</td>
                    <td className="p-4 text-slate-500">{sale.customerName}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600">
                      R$ {sale.total.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm("Deseja realmente estornar esta venda?")) {
                            onDeleteSale(sale.id);
                            showSuccess("Venda estornada!");
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {sales.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Nenhuma venda registrada hoje.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Nova Venda</h3>
                <p className="text-xs text-emerald-100 mt-1">Selecione os itens para registrar a venda</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-slate-700 font-semibold">Produto *</Label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Estoque: {p.quantity} | R$ {p.salePrice.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="saleQty" className="text-slate-700 font-semibold">Quantidade *</Label>
                  <Input
                    id="saleQty"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="rounded-xl border-slate-200"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Forma de Pagamento</Label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Pix">Pix 📱</option>
                    <option value="Dinheiro">Dinheiro 💵</option>
                    <option value="Cartão de Crédito">Cartão de Crédito 💳</option>
                    <option value="Cartão de Débito">Cartão de Débito 💳</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="saleCustomer" className="text-slate-700 font-semibold">Nome do Cliente (Opcional)</Label>
                <Input
                  id="saleCustomer"
                  placeholder="Ex: Carlos Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl border-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  Confirmar Venda
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}