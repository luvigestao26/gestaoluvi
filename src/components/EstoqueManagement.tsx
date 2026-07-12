"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Edit, Package, AlertTriangle, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";

interface EstoqueManagementProps {
  products: any[];
  onAddProduct: (product: any) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (product: any) => void;
}

export default function EstoqueManagement({ products, onAddProduct, onDeleteProduct, onUpdateProduct }: EstoqueManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Bebidas");
  const [quantity, setQuantity] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !salePrice) {
      showError("Por favor, preencha os campos obrigatórios.");
      return;
    }

    if (editingProduct) {
      const updated = {
        ...editingProduct,
        name,
        category,
        quantity: parseInt(quantity),
        minQuantity: parseInt(minQuantity || "0"),
        costPrice: parseFloat(costPrice || "0"),
        salePrice: parseFloat(salePrice)
      };
      onUpdateProduct(updated);
      showSuccess("Produto atualizado com sucesso!");
      setEditingProduct(null);
    } else {
      const newProduct = {
        id: Date.now().toString(),
        name,
        category,
        quantity: parseInt(quantity),
        minQuantity: parseInt(minQuantity || "0"),
        costPrice: parseFloat(costPrice || "0"),
        salePrice: parseFloat(salePrice)
      };
      onAddProduct(newProduct);
      showSuccess("Produto cadastrado com sucesso!");
    }

    // Reset
    setName("");
    setQuantity("");
    setMinQuantity("");
    setCostPrice("");
    setSalePrice("");
    setIsOpen(false);
  };

  const startEdit = (product: any) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setQuantity(product.quantity.toString());
    setMinQuantity(product.minQuantity.toString());
    setCostPrice(product.costPrice.toString());
    setSalePrice(product.salePrice.toString());
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Buscar produto por nome ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-slate-200"
          />
        </div>
        <Button 
          onClick={() => {
            setEditingProduct(null);
            setName("");
            setQuantity("");
            setMinQuantity("");
            setCostPrice("");
            setSalePrice("");
            setIsOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2"
        >
          <Plus size={18} />
          Novo Produto
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const isLowStock = product.quantity <= product.minQuantity;
          return (
            <Card key={product.id} className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Package size={18} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-800">{product.name}</CardTitle>
                      <CardDescription>{product.category}</CardDescription>
                    </div>
                  </div>
                  {isLowStock && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      <AlertTriangle size={12} />
                      Estoque Baixo
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-xs text-slate-500 block">Quantidade</span>
                    <span className="font-bold text-slate-800 text-lg">{product.quantity} un</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-xs text-slate-500 block">Preço de Venda</span>
                    <span className="font-bold text-emerald-600 text-lg">R$ {product.salePrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => startEdit(product)}
                    className="flex-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                  >
                    <Edit size={14} />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Deseja realmente excluir o produto "${product.name}"?`)) {
                        onDeleteProduct(product.id);
                        showSuccess("Produto excluído!");
                      }
                    }}
                    className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-slate-500">Nenhum produto encontrado no estoque.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
                <p className="text-xs text-emerald-100 mt-1">Cadastre ou atualize itens do estoque</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="prodName" className="text-slate-700 font-semibold">Nome do Produto *</Label>
                <Input
                  id="prodName"
                  placeholder="Ex: Água Mineral 500ml"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Categoria</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Bebidas">Bebidas 🥤</option>
                    <option value="Lanches">Lanches 🍔</option>
                    <option value="Acessórios">Acessórios 🎾</option>
                    <option value="Outros">Outros 📦</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="prodQty" className="text-slate-700 font-semibold">Quantidade *</Label>
                  <Input
                    id="prodQty"
                    type="number"
                    placeholder="Ex: 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="rounded-xl border-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="prodMinQty" className="text-slate-700 font-semibold">Qtd Mínima (Alerta)</Label>
                  <Input
                    id="prodMinQty"
                    type="number"
                    placeholder="Ex: 10"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    className="rounded-xl border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="prodCost" className="text-slate-700 font-semibold">Preço de Custo (R$)</Label>
                  <Input
                    id="prodCost"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 1.50"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="prodSale" className="text-slate-700 font-semibold">Preço de Venda (R$) *</Label>
                <Input
                  id="prodSale"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 4.00"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
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
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}