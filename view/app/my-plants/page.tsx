"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { 
  LayoutGrid, 
  List as ListIcon, 
  Search, 
  Sprout, 
  ArrowRight,
  Droplets,
  Scissors,
  MoreVertical,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus // Adicionei para o botão de adicionar
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- TIPAGEM ---
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
  id: number;
  apelido: string;
  catalogo: Catalogo;
}

// Interface do Feedback
interface FeedbackState {
    isOpen: boolean
    type: "success" | "error"
    title: string
    message: string
}

export default function MyPlantsPage() {
  const [plants, setPlants] = useState<MinhaPlanta[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");

  // States para Deletar
  const [plantToDelete, setPlantToDelete] = useState<MinhaPlanta | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State de Feedback
  const [feedback, setFeedback] = useState<FeedbackState>({
    isOpen: false,
    type: "success",
    title: "",
    message: ""
  });

  const showFeedback = (type: "success" | "error", title: string, message: string) => {
    setFeedback({ isOpen: true, type, title, message });
  };

  // --- BUSCA DE DADOS ---
  const fetchPlants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("joja_token");
      const response = await axios.get("http://localhost:8000/planta/minhas-plantas", {
          headers: { Authorization: `Bearer ${token}` } 
      });
      setPlants(response.data);
    } catch (error) {
      console.error("Erro ao buscar plantas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  // --- LÓGICA DE DELETE (SUA LÓGICA ORIGINAL) ---
  const openDeleteModal = (e: React.MouseEvent, planta: MinhaPlanta) => {
    e.preventDefault(); // Impede a navegação do Link
    e.stopPropagation();
    setPlantToDelete(planta);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!plantToDelete) return;
    
    setIsDeleting(true);
    const token = localStorage.getItem("joja_token");

    try {
        await axios.delete(`http://localhost:8000/planta/${plantToDelete.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setPlants((prev) => prev.filter((p) => p.id !== plantToDelete.id));
        
        setIsDeleteOpen(false);
        showFeedback("success", "Planta removida", `Você se despediu de "${plantToDelete.apelido}" com sucesso.`);
        setPlantToDelete(null);

    } catch (error) {
        console.error("Erro ao deletar:", error);
        setIsDeleteOpen(false);
        showFeedback("error", "Erro ao remover", "Não foi possível deletar a planta. Tente novamente.");
    } finally {
        setIsDeleting(false);
    }
  };

  // --- FILTRO DE BUSCA ---
  const filteredPlants = plants.filter((p) => 
    p.apelido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.catalogo.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Fundo geral da página
    <div className="min-h-screen bg-quinquenary pb-24 font-poppins">
      
      {/* --- HEADER VERDE ESTILO "MEUS JARDINS" --- */}
      <div className="bg-primary pt-10 pb-16 px-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight flex items-center justify-center md:justify-start gap-3">
               <Sprout className="fill-white/20 text-white" /> Minhas Plantas
            </h1>
            <p className="text-white/80 text-lg font-light">
              Gerencie sua coleção pessoal e acompanhe a saúde das suas verdinhas.
            </p>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL (COM MARGEM NEGATIVA PARA SUBIR) --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-8">
        
        {/* BARRA DE FILTRO E VISUALIZAÇÃO FLUTUANTE */}
        <div className="bg-white p-4 rounded-2xl shadow-lg shadow-black/5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary h-4 w-4" />
                <Input 
                  placeholder="Buscar pelo apelido ou espécie..." 
                  className="pl-10 bg-quaternary/30 border-tertiary/20 focus:ring-secondary focus:border-secondary rounded-xl h-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex bg-quaternary/50 rounded-xl p-1 border border-tertiary/10">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className={`rounded-lg transition-all ${viewMode === "grid" ? "shadow-sm" : "text-tertiary hover:text-primary"}`}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid size={18} />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className={`rounded-lg transition-all ${viewMode === "list" ? "shadow-sm" : "text-tertiary hover:text-primary"}`}
                  onClick={() => setViewMode("list")}
                >
                  <ListIcon size={18} />
                </Button>
            </div>
        </div>

        {/* --- LISTAGEM DE PLANTAS (SUA LÓGICA) --- */}
        {loading ? (
            <PlantsSkeleton viewMode={viewMode} />
        ) : filteredPlants.length === 0 ? (
            <EmptyState />
        ) : viewMode === "grid" ? (
            
            // --- GRID VIEW (Visual atualizado, Lógica antiga) ---
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlants.map((planta) => (
                <Link 
                key={planta.id} 
                href={`/my-plants/${planta.id}`}
                className="group bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-transparent hover:border-primary/5 relative block ring-1 ring-tertiary/5"
                >
                {/* MENU DE OPÇÕES (GRID) */}
                <div className="absolute top-3 right-3 z-20">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 bg-black/20 backdrop-blur-md hover:bg-white text-white hover:text-tertiary rounded-full shadow-sm transition-colors"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        >
                        <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-tertiary/20 rounded-xl shadow-lg w-40">
                        <DropdownMenuItem 
                        className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer py-2.5 font-medium"
                        onClick={(e) => openDeleteModal(e, planta)}
                        >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Deletar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="relative h-56 overflow-hidden">
                    <img 
                    src={planta.catalogo.img_url || "/placeholder-plant.jpg"} 
                    alt={planta.catalogo.nome}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-5 text-white">
                    <p className="text-xs font-medium opacity-90 italic mb-1">{planta.catalogo.nome_cientifico}</p>
                    <p className="font-bold text-xl">{planta.apelido}</p>
                    </div>
                </div>
                
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-[10px] text-tertiary uppercase font-bold tracking-wider mb-0.5">Espécie</p>
                        <p className="text-sm text-primary font-bold truncate w-40">{planta.catalogo.nome}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {planta.catalogo.categoria}
                    </Badge>
                    </div>

                    {/* Info rápida de cuidados */}
                    <div className="flex gap-2 pt-3 border-t border-dashed border-tertiary/10">
                        <div className="flex-1 bg-blue-50/50 p-2 rounded-lg flex items-center justify-center gap-1.5 text-xs text-blue-600">
                            <Droplets size={13} className="fill-blue-600/20" />
                            <span className="font-medium">{planta.catalogo.periodicidade_rega}d</span>
                        </div>
                        <div className="flex-1 bg-orange-50/50 p-2 rounded-lg flex items-center justify-center gap-1.5 text-xs text-orange-600">
                            <Scissors size={13} className="fill-orange-600/20" />
                            <span className="font-medium">{planta.catalogo.periodicidade_poda}d</span>
                        </div>
                    </div>
                </div>
                </Link>
            ))}
            </div>

        ) : (
            
            // --- LIST VIEW (Visual atualizado, Lógica antiga) ---
            <div className="bg-white rounded-3xl shadow-sm border border-tertiary/5 overflow-hidden ring-1 ring-tertiary/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                <thead className="bg-quaternary/50 text-tertiary uppercase text-xs font-bold tracking-wider border-b border-tertiary/10">
                    <tr>
                    <th className="p-5 pl-8">Planta</th>
                    <th className="p-5">Espécie / Categoria</th>
                    <th className="p-5 text-center">Rega</th>
                    <th className="p-5 text-center">Poda</th>
                    <th className="p-5 text-right pr-8">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredPlants.map((planta) => (
                    <tr key={planta.id} className="hover:bg-primary/5 transition-colors group">
                        <td className="p-4 pl-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shadow-sm ring-1 ring-black/5">
                            <img 
                                src={planta.catalogo.img_url} 
                                alt={planta.apelido} 
                                className="w-full h-full object-cover"
                            />
                            </div>
                            <div>
                            <p className="font-bold text-primary text-base">{planta.apelido}</p>
                            <p className="text-xs text-tertiary italic">{planta.catalogo.nome_cientifico}</p>
                            </div>
                        </div>
                        </td>
                        <td className="p-4">
                        <p className="text-gray-700 font-medium">{planta.catalogo.nome}</p>
                        <span className="text-[10px] text-tertiary bg-quaternary px-2 py-0.5 rounded-full mt-1 inline-block border border-tertiary/10">
                            {planta.catalogo.categoria}
                        </span>
                        </td>
                        <td className="p-4 text-center">
                            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                <Droplets size={12} /> {planta.catalogo.periodicidade_rega} dias
                            </div>
                        </td>
                        <td className="p-4 text-center">
                            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                                <Scissors size={12} /> {planta.catalogo.periodicidade_poda} dias
                            </div>
                        </td>
                        <td className="p-4 text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                            <Link href={`/my-plants/${planta.id}`}>
                                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary hover:text-white transition-colors rounded-xl h-9">
                                Detalhes <ArrowRight size={14} className="ml-2" />
                                </Button>
                            </Link>

                            {/* MENU DE OPÇÕES (LISTA) */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-tertiary hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                    <MoreVertical size={16} />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white border-tertiary/20">
                                <DropdownMenuItem 
                                    className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                    onClick={(e) => openDeleteModal(e, planta)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Deletar
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        )}
      </div>

      {/* --- MODAL DE CONFIRMAÇÃO DE DELETE (Visual Melhorado) --- */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl">
            <AlertDialogHeader className="flex flex-col items-center text-center pt-6">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <AlertDialogTitle className="text-2xl font-bold text-primary">Excluir Planta?</AlertDialogTitle>
                <AlertDialogDescription className="text-tertiary text-lg mt-2 px-4">
                    Você está prestes a remover <strong>{plantToDelete?.apelido}</strong> da sua coleção. <br/>
                    Isso removerá todo o histórico de cuidados.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 p-4 bg-gray-50 -mx-6 -mb-6 rounded-b-3xl flex gap-3 justify-center sm:justify-center">
                <AlertDialogCancel className="rounded-xl h-12 flex-1 border-tertiary/20 text-tertiary hover:bg-white hover:text-primary">
                    Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-200 h-12 flex-1 border-0"
                >
                    {isDeleting ? <Loader2 className="w-5 h-5 animate-spin"/> : "Sim, Excluir"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- MODAL DE FEEDBACK (Visual Melhorado) --- */}
      <AlertDialog 
        open={feedback.isOpen} 
        onOpenChange={(open) => setFeedback(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent className={`bg-white rounded-3xl shadow-xl border-none p-0 overflow-hidden`}>
            <div className={`p-8 flex flex-col items-center text-center ${
                 feedback.type === 'success' ? 'bg-green-50/50' : 'bg-red-50/50'
            }`}>
                 <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-sm ${
                    feedback.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {feedback.type === 'success' ? (
                      <CheckCircle2 className="w-10 h-10" />
                  ) : (
                      <XCircle className="w-10 h-10" />
                  )}
                </div>
                
                <AlertDialogTitle className={`text-2xl font-bold ${
                    feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                    {feedback.title}
                </AlertDialogTitle>
                
                <AlertDialogDescription className="text-tertiary text-lg mt-2">
                    {feedback.message}
                </AlertDialogDescription>
            </div>
            
            <div className="p-6 bg-white border-t border-gray-100">
                <AlertDialogAction 
                    onClick={() => setFeedback(prev => ({ ...prev, isOpen: false }))} 
                    className={`w-full rounded-xl h-12 text-white font-semibold text-lg shadow-lg ${
                        feedback.type === 'success' 
                        ? 'bg-green-600 hover:bg-green-700 shadow-green-200' 
                        : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                    }`}
                >
                    Ok, entendi
                </AlertDialogAction>
            </div>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

// --- SUB-COMPONENTES AUXILIARES (Visual melhorado) ---

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-tertiary/20 text-center mt-8">
      <div className="bg-quinquenary p-6 rounded-full mb-6">
        <Sprout size={48} className="text-secondary" />
      </div>
      <h3 className="text-xl font-bold text-primary mb-2">Seu jardim está vazio</h3>
      <p className="text-tertiary max-w-md mb-8">
        Você ainda não adicionou nenhuma planta à sua coleção. Que tal explorar nosso catálogo e começar seu jardim hoje?
      </p>
      <Link href="/catalogue">
        <Button className="bg-secondary hover:bg-secondary/90 text-white px-8 py-6 rounded-xl text-lg shadow-lg shadow-secondary/30 transition-all hover:scale-105">
          Explorar Catálogo
        </Button>
      </Link>
    </div>
  );
}

function PlantsSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-3xl p-6 space-y-4 shadow-sm border border-tertiary/5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-24 ml-auto" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-3xl p-4 space-y-4 shadow-sm">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-2">
             <Skeleton className="h-8 w-full rounded-lg" />
             <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}