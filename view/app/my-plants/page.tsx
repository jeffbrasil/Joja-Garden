"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios"; // Ou sua instância de api configurada
import { useAuth } from "@/context/AuthContext"; // Para pegar o token se necessário
import { 
  LayoutGrid, 
  List as ListIcon, 
  Search, 
  Sprout, 
  ArrowRight,
  Droplets,
  Scissors
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// --- TIPAGEM BASEADA NO SWAGGER ---
interface Catalogo {
  id: number;
  nome: string;
  nome_cientifico: string;
  categoria: string;
  familia: string;
  descricao: string;
  instrucoes_cuidado: string;
  img_url: string;
  periodicidade_rega: number;
  periodicidade_poda: number;
  periodicidade_adubo: number;
}

interface MinhaPlanta {
  id: number; // ID da relação (User <-> Planta)
  apelido: string;
  catalogo: Catalogo;
}

export default function MyPlantsPage() {
  const { user } = useAuth(); // Se precisar do token/user
  const [plants, setPlants] = useState<MinhaPlanta[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");

  // --- BUSCA DE DADOS ---
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        // Ajuste a URL base conforme sua configuração (ex: process.env.NEXT_PUBLIC_API_URL)
        // Lembre-se de passar o token no header Authorization se o axios não estiver configurado globalmente
        const response = await axios.get("http://localhost:8000/planta/minhas-plantas", {
            headers: { Authorization: `Bearer ${localStorage.getItem("joja_token")}` } 
        });
        
        setPlants(response.data);
      } catch (error) {
        console.error("Erro ao buscar plantas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // --- FILTRO DE BUSCA (OPCIONAL MAS ÚTIL) ---
  const filteredPlants = plants.filter((p) => 
    p.apelido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.catalogo.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-quaternary/30 p-6 md:p-12 font-poppins">
      
      {/* --- CABEÇALHO DA PÁGINA --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Sprout className="fill-primary text-primary" /> Minhas Plantas
          </h1>
          <p className="text-tertiary mt-1">
            Gerencie sua coleção pessoal e acompanhe a saúde das suas verdinhas.
          </p>
        </div>

        {/* Controles: Busca e Toggle de View */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Buscar pelo apelido..." 
              className="pl-9 bg-white border-tertiary/20 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-white rounded-lg border border-tertiary/20 p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setViewMode("grid")}
              title="Visualização em Grade"
            >
              <LayoutGrid size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setViewMode("list")}
              title="Visualização em Lista"
            >
              <ListIcon size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO --- */}
      {loading ? (
        <PlantsSkeleton viewMode={viewMode} />
      ) : filteredPlants.length === 0 ? (
        <EmptyState />
      ) : viewMode === "grid" ? (
        
        // --- VIEW MODE: GRID ---
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlants.map((planta) => (
            <Link 
              key={planta.id} 
              href={`/my-plants/${planta.id}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-transparent hover:border-primary/20"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={planta.catalogo.img_url || "/placeholder-plant.jpg"} 
                  alt={planta.catalogo.nome}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                <div className="absolute bottom-3 left-4 text-white">
                  <p className="text-xs font-light opacity-90 italic">{planta.catalogo.nome_cientifico}</p>
                  <p className="font-semibold text-lg">{planta.apelido}</p>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-tertiary uppercase font-bold tracking-wider">Espécie</p>
                    <p className="text-sm text-gray-700 font-medium truncate w-40">{planta.catalogo.nome}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {planta.catalogo.categoria}
                  </Badge>
                </div>

                {/* Info rápida de cuidados */}
                <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500" title="Rega">
                    <Droplets size={14} className="text-blue-400" />
                    <span>{planta.catalogo.periodicidade_rega} dias</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500" title="Poda">
                    <Scissors size={14} className="text-orange-400" />
                    <span>{planta.catalogo.periodicidade_poda} dias</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      ) : (
        
        // --- VIEW MODE: LIST ---
        <div className="bg-white rounded-xl shadow-sm border border-tertiary/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-quaternary/50 text-tertiary uppercase text-xs font-bold tracking-wider border-b border-tertiary/10">
                <tr>
                  <th className="p-4 pl-6">Planta</th>
                  <th className="p-4">Espécie / Categoria</th>
                  <th className="p-4 text-center">Rega (dias)</th>
                  <th className="p-4 text-center">Poda (dias)</th>
                  <th className="p-4 text-right pr-6">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPlants.map((planta) => (
                  <tr key={planta.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                          <img 
                            src={planta.catalogo.img_url} 
                            alt={planta.apelido} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{planta.apelido}</p>
                          <p className="text-xs text-gray-400 italic">{planta.catalogo.nome_cientifico}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-700 font-medium">{planta.catalogo.nome}</p>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {planta.catalogo.categoria}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-600">
                      {planta.catalogo.periodicidade_rega}
                    </td>
                    <td className="p-4 text-center text-gray-600">
                      {planta.catalogo.periodicidade_poda}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <Link href={`/view/app/my-plants/${planta.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary hover:text-white transition-colors">
                          Detalhes <ArrowRight size={14} className="ml-2" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTES AUXILIARES ---

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-tertiary/20 text-center">
      <div className="bg-green-50 p-6 rounded-full mb-6 animate-pulse">
        <Sprout size={48} className="text-primary" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Seu jardim está vazio</h3>
      <p className="text-gray-500 max-w-md mb-8">
        Você ainda não adicionou nenhuma planta à sua coleção. Que tal explorar nosso catálogo e começar seu jardim hoje?
      </p>
      <Link href="/catalog">
        <Button className="bg-primary hover:bg-secondary text-white px-8 py-6 rounded-full text-lg shadow-lg shadow-primary/30 transition-all hover:scale-105">
          Explorar Catálogo
        </Button>
      </Link>
    </div>
  );
}

function PlantsSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-4 space-y-3">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}