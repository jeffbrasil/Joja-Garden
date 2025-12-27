"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, ShoppingCart, Heart, Plus } from "lucide-react"; 

export default function CatalogoPage() {
  const plantas = [
    { id: 1, nome: "Aloe Vera", cientifico: "Aloe barbadensis", preco: "R$ 25,00", img: "/placeholder-aloe.png", tags: ["Interna", "Fácil"] },
    { id: 2, nome: "Costela de Adão", cientifico: "Monstera deliciosa", preco: "R$ 80,00", img: "/placeholder-monstera.png", tags: ["Sombra", "Média"] },
    { id: 3, nome: "Cacto Vela", cientifico: "Cereus peruvianus", preco: "R$ 45,00", img: "/placeholder-cacto.png", tags: ["Sol Pleno", "Fácil"] },
    { id: 4, nome: "Espada de São Jorge", cientifico: "Dracaena trifasciata", preco: "R$ 30,00", img: "/placeholder-espada.png", tags: ["Resistente", "Fácil"] },
    { id: 5, nome: "Samambaia", cientifico: "Nephrolepis exaltata", preco: "R$ 35,00", img: "/placeholder-samambaia.png", tags: ["Umidade", "Pendende"] },
    { id: 6, nome: "Ficus Lyrata", cientifico: "Ficus lyrata", preco: "R$ 120,00", img: "/placeholder-ficus.png", tags: ["Árvore", "Difícil"] },
  ];

  return (
    <div className="flex flex-col items-center w-full h-auto pb-10">
      
      {/* --- HEADER DA PÁGINA --- */}
      <div className="w-full bg-quaternary shadow-sm shadow-tertiary/20 py-8 px-6 md:px-12 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Catálogo de Plantas</h1>
            <p className="text-tertiary mt-1">Encontre a planta perfeita para o seu jardim.</p>
          </div>
          
          {/* Barra de Pesquisa Estilizada */}
          <div className="flex items-center bg-quinquenary rounded-full px-4 py-2 w-full md:w-96 shadow-inner border border-tertiary/30 focus-within:border-secondary transition-colors">
            <Search className="text-tertiary w-5 h-5 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar plantas..." 
              className="bg-transparent border-none outline-none text-primary placeholder-tertiary w-full text-sm"
            />
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="max-w-7xl w-full px-6 flex flex-col gap-6">
        
        {/* Filtros e Ordenação */}
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-quaternary rounded-full h-8 text-xs px-4 transition-colors">
              Todas
            </Button>
            <Button variant="ghost" className="text-tertiary hover:text-primary h-8 text-xs px-4">
              Interior
            </Button>
            <Button variant="ghost" className="text-tertiary hover:text-primary h-8 text-xs px-4">
              Exterior
            </Button>
          </div>
          
          <button className="flex items-center gap-2 text-primary font-medium text-sm hover:opacity-80">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>

        {/* --- GRID DE PRODUTOS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plantas.map((planta) => (
            <div 
              key={planta.id} 
              className="group bg-quaternary rounded-xl p-4 shadow-md shadow-tertiary/10 hover:shadow-xl hover:shadow-tertiary/20 transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-tertiary/30 cursor-pointer flex flex-col"
            >
              {/* Área da Imagem (Placeholder com cor se não houver img) */}
              <div className="relative w-full aspect-[4/5] bg-quinquenary rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                {/* Aqui viria a tag <Image /> do Next.js */}
                <div className="text-tertiary opacity-40 text-4xl">🌿</div>
                
                {/* Botão de Favoritar (Aparece no Hover) */}
                <button className="absolute top-3 right-3 p-2 bg-quaternary rounded-full shadow-sm text-tertiary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>

              {/* Informações da Planta */}
              <div className="flex flex-col gap-1 mb-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg text-primary leading-tight">{planta.nome}</h3>
                  <span className="font-bold text-secondary text-sm">{planta.preco}</span>
                </div>
                <p className="text-xs text-tertiary italic">{planta.cientifico}</p>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-4">
                {planta.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold bg-quinquenary text-secondary px-2 py-1 rounded-sm">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Botão de Ação (Adicionar ao Jardim/Carrinho) */}
              <div className="mt-auto">
                 <Button className="w-full bg-primary hover:bg-secondary text-white shadow-md hover:shadow-lg transition-all h-10 rounded-lg flex items-center justify-center gap-2 text-sm">
                    <Plus className="w-4 h-4" />
                    Adicionar ao Jardim
                 </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Paginação / Carregar Mais */}
        <div className="w-full flex justify-center mt-8">
            <button className="text-tertiary border-b border-tertiary pb-1 hover:text-primary hover:border-primary transition-colors text-sm">
                Carregar mais plantas
            </button>
        </div>

      </div>
    </div>
  );
}