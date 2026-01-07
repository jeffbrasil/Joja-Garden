"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Search, 
  Leaf, 
  Loader2, 
  Plus, 
  Sprout, 
  Calendar,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { catalogoService } from "@/services/catalogoService";
import { IPlanta } from "@/types"; // Certifique-se de ter esse tipo ou use any

export default function AddPlantToUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin } = useAuth();

  // Dados do Usuário Alvo (vindos da URL)
  const targetIdStr = searchParams.get("id");
  const targetNome = searchParams.get("nome");
  const targetId = targetIdStr ? parseInt(targetIdStr) : null;

  // Estados
  const [catalogo, setCatalogo] = useState<IPlanta[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [busca, setBusca] = useState("");
  
  // Estado do Modal de Confirmação
  const [selectedPlant, setSelectedPlant] = useState<IPlanta | null>(null);
  const [apelido, setApelido] = useState("");
  const [dataPlantio, setDataPlantio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Verificação de Segurança
  useEffect(() => {
    if (!isAdmin) return;
    if (!targetId || !targetNome) {
        alert("Usuário não selecionado.");
        router.push("/manage-users");
    }
  }, [isAdmin, targetId, targetNome, router]);

  // 2. Carregar Catálogo
  useEffect(() => {
    const fetchCatalogo = async () => {
      try {
        setLoadingCatalogo(true);
        const data = await catalogoService.getAll();
        setCatalogo(data);
      } catch (error) {
        console.error("Erro ao carregar catálogo:", error);
      } finally {
        setLoadingCatalogo(false);
      }
    };
    fetchCatalogo();
  }, []);

  // Filtragem local (se o endpoint de busca não for usado)
  const plantasFiltradas = catalogo.filter((p) => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.nome_cientifico?.toLowerCase().includes(busca.toLowerCase())
  );

  // Abrir Modal
  const handleSelectPlant = (planta: IPlanta) => {
    setSelectedPlant(planta);
    setApelido(planta.nome); // Sugere o nome da planta como apelido
    setDataPlantio(new Date().toISOString().split('T')[0]); // Data de hoje (YYYY-MM-DD)
  };

  // Enviar para o Backend
  const handleConfirmAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || !selectedPlant) return;

    setIsSubmitting(true);
    try {
      // Chama o endpoint de adicionar planta ao usuário
      await userService.addPlantToUser(targetId, {
        id: selectedPlant.id!, // ID da planta no catálogo
        apelido: apelido,
        data_plantio: dataPlantio
      });

      alert(`Sucesso!\nA planta "${selectedPlant.nome}" foi adicionada ao jardim de ${targetNome}.`);
      router.push("/manage-users");
      
    } catch (error) {
      console.error("Erro ao adicionar planta:", error);
      alert("Erro ao adicionar planta. Verifique o console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-50/30 pb-10 font-poppins relative">
      
      {/* --- HEADER --- */}
      <div className="w-full bg-quaternary shadow-sm shadow-tertiary/20 py-6 px-6 md:px-12 mb-8 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="text-tertiary hover:text-primary hover:bg-quinquenary rounded-full p-2"
            >
                <ArrowLeft size={24} />
            </Button>
            <div>
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Sprout className="w-6 h-6" /> Adicionar Planta
                </h1>
                <p className="text-tertiary text-sm mt-1">
                Para o usuário: <span className="font-semibold text-primary">{targetNome}</span>
                </p>
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="flex items-center bg-quinquenary rounded-full px-4 py-2 w-full md:w-80 shadow-inner border border-tertiary/30 focus-within:border-secondary transition-colors">
            <Search className="text-tertiary w-5 h-5 mr-2" />
            <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar no catálogo..."
                className="bg-transparent border-none outline-none text-primary placeholder-tertiary w-full text-sm"
            />
          </div>
        </div>
      </div>

      {/* --- GRID DE PLANTAS --- */}
      <div className="max-w-6xl w-full px-6">
        {loadingCatalogo ? (
           <div className="flex flex-col items-center justify-center py-20 text-tertiary">
             <Loader2 className="w-10 h-10 animate-spin mb-4" />
             <p>Carregando catálogo...</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plantasFiltradas.map((planta) => (
              <div 
                key={planta.id}
                className="group bg-white rounded-xl overflow-hidden border border-tertiary/10 hover:border-primary/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
                onClick={() => handleSelectPlant(planta)}
              >
                {/* Imagem */}
                <div className="h-40 bg-quinquenary relative overflow-hidden flex items-center justify-center">
                    {planta.img_url ? (
                        <img src={planta.img_url} alt={planta.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <Leaf className="w-12 h-12 text-tertiary/40" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            Selecionar
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-primary text-lg leading-tight">{planta.nome}</h3>
                    <p className="text-xs text-tertiary italic mb-2">{planta.nome_cientifico}</p>
                    <span className="inline-block bg-quinquenary text-secondary text-[10px] uppercase font-bold px-2 py-0.5 rounded w-fit">
                        {planta.categoria}
                    </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      {selectedPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-quaternary p-4 border-b border-tertiary/10 flex justify-between items-center">
                    <h3 className="font-bold text-primary text-lg">Confirmar Adição</h3>
                    <button onClick={() => setSelectedPlant(null)} className="text-tertiary hover:text-red-500">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleConfirmAdd} className="p-6 space-y-4">
                    <div className="bg-green-50 p-3 rounded-lg flex items-center gap-3 border border-green-100">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <Leaf className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-green-800 uppercase font-bold">Planta Selecionada</p>
                            <p className="font-semibold text-green-900">{selectedPlant.nome}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="apelido">Apelido da Planta</Label>
                        <Input 
                            id="apelido"
                            value={apelido}
                            onChange={(e) => setApelido(e.target.value)}
                            placeholder="Ex: Minha Rosinha"
                            className="bg-gray-50"
                        />
                        <p className="text-[10px] text-gray-500">Como o usuário vai chamar essa planta.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="data">Data do Plantio</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                            <Input 
                                id="data"
                                type="date"
                                value={dataPlantio}
                                onChange={(e) => setDataPlantio(e.target.value)}
                                className="pl-9 bg-gray-50"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setSelectedPlant(null)}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            className="flex-1 bg-primary hover:bg-secondary text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}