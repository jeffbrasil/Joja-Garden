"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, Heart, Plus, Loader2 } from "lucide-react";
import { catalogoService } from "@/services/catalogoService";
import { IPlanta } from "@/types";

export default function CatalogoPage() {
  const [plantas, setPlantas] = useState<IPlanta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlantas() {
      try {
        // Certifique-se que o catalogoService.getAll() aponta para a rota certa
        const dados = await catalogoService.getAll();
        setPlantas(dados);
      } catch (error) {
        console.error("Erro ao buscar plantas:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlantas();
  }, []);

  return (
    <div className="flex flex-col items-center w-full h-auto pb-10">
      
      {/* --- HEADER --- */}
      <div className="w-full bg-quaternary shadow-sm shadow-tertiary/20 py-8 px-6 md:px-12 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Catálogo de Plantas</h1>
            <p className="text-tertiary mt-1">Encontre a planta perfeita para o seu jardim.</p>
          </div>
          
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

      {/* --- CONTEÚDO --- */}
      <div className="max-w-7xl w-full px-6 flex flex-col gap-6">
        
        {/* Filtros */}
        <div className="flex justify-between items-center w-full">
            <div className="flex gap-2">
                <Button variant="outline" className="border-secondary text-secondary rounded-full h-8 text-xs px-4">Todas</Button>
            </div>
            <button className="flex items-center gap-2 text-primary font-medium text-sm hover:opacity-80">
              <Filter className="w-4 h-4" /> Filtrar
            </button>
        </div>

        {/* --- GRID DINÂMICO --- */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-tertiary">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Carregando catálogo...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plantas.map((planta, index) => (
              <div 
                // Usa ID se existir, senão usa o índice do array (fallback)
                key={planta.id || index} 
                className="group bg-quaternary rounded-xl p-4 shadow-md shadow-tertiary/10 hover:shadow-xl hover:shadow-tertiary/20 transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-tertiary/30 cursor-pointer flex flex-col"
              >
                {/* Imagem */}
                <div className="relative w-full aspect-[4/5] bg-quinquenary rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                  {planta.img_url ? (
                    <img src={planta.img_url} alt={planta.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-tertiary opacity-40 text-4xl">🌿</div>
                  )}
                  
                  <button className="absolute top-3 right-3 p-2 bg-quaternary rounded-full shadow-sm text-tertiary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Informações */}
                <div className="flex flex-col gap-1 mb-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-primary leading-tight">{planta.nome}</h3>
                    {/* Sem preço, pois o backend não enviou */}
                  </div>
                  <p className="text-xs text-tertiary italic">{planta.nome_cientifico}</p>
                  <p className="text-[10px] text-tertiary/80">{planta.familia}</p>
                </div>

                {/* Categoria (Antigas Tags) */}
                <div className="flex gap-2 mb-4">
                   <span className="text-[10px] uppercase tracking-wider font-semibold bg-quinquenary text-secondary px-2 py-1 rounded-sm">
                      {planta.categoria}
                   </span>
                </div>

                {/* Botão */}
                <div className="mt-auto">
                   <Button className="w-full bg-primary hover:bg-secondary text-white shadow-md hover:shadow-lg transition-all h-10 rounded-lg flex items-center justify-center gap-2 text-sm">
                      <Plus className="w-4 h-4" />
                      Adicionar ao Jardim
                   </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}