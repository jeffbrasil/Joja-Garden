"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Plus,
  Loader2,
  X,
  Leaf,
  LayoutGrid,
  List,
  Droplets,
  Scissors,
  Sprout,
  Sun,
  Flower2,
  Image as ImageIcon
} from "lucide-react";
import { catalogoService } from "@/services/catalogoService";
import { IPlanta } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { AlertModal } from "@/components/modals/alert-modal";

// Definição das categorias para o filtro
const CATEGORIAS = ["Todas", "Ornamental", "Frutífera", "Hortaliça", "Erva Medicinal"];

export default function CatalogoPage() {
  const [plantas, setPlantas] = useState<IPlanta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.tipo_usuario === "admin";

  // --- ESTADOS DE CONTROLE DE UI & FILTROS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // --- ESTADOS DOS MODAIS ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Form Admin
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Feedback Sucesso
  const [selectedPlant, setSelectedPlant] = useState<IPlanta | null>(null); // Leitura Detalhes
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado inicial do form (Admin)
  const initialFormState = {
    nome: "",
    nome_cientifico: "",
    categoria: "Ornamental",
    familia: "",
    descricao: "",
    instrucoes_cuidado: "",
    img_url: "",
    periodicidade_rega: 2,
    periodicidade_poda: 30,
    periodicidade_adubo: 15,
  };
  const [newPlant, setNewPlant] = useState(initialFormState);

  const fetchPlantas = async () => {
    try {
      setIsLoading(true);
      const dados = await catalogoService.getAll();
      setPlantas(dados);
    } catch (error) {
      console.error("Erro ao buscar plantas:", error);
      toast.error("Erro ao carregar o catálogo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantas();
  }, []);

  // --- LÓGICA DE FILTRAGEM ---
  const filteredPlantas = plantas.filter((planta) => {
    const matchesSearch =
      planta.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planta.nome_cientifico.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory =
      selectedCategory === "Todas" || planta.categoria === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await catalogoService.create(newPlant);
      
      // Fecha modal de criação e abre o de sucesso
      setIsCreateModalOpen(false);
      setIsSuccessModalOpen(true);
      
      fetchPlantas();
      setNewPlant(initialFormState);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao adicionar planta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewPlant((prev) => ({
      ...prev,
      [name]: name.includes("periodicidade") ? Number(value) : value,
    }));
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen pb-12 relative bg-quinquenary font-poppins">
      
      {/* --- HEADER --- */}
      <div className="w-full bg-primary relative overflow-hidden pb-12 pt-24 px-6 md:px-12 rounded-b-[3rem] shadow-xl shadow-primary/20">
        {/* Background Pattern Sutil */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-green-50 text-xs font-semibold uppercase tracking-wider mb-2">
                <Flower2 className="w-3 h-3" /> Enciclopédia Viva
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Catálogo Botânico
            </h1>
            <p className="text-green-50/80 text-lg font-light max-w-md">
              Descubra espécies, aprenda cuidados e expanda seu jardim digital.
            </p>
          </div>

          {/* Barra de Pesquisa */}
          <div className="w-full md:w-auto flex-1 max-w-md">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-green-100 group-focus-within:text-white transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nome ou espécie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder-green-100/50 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-white/30 transition-all shadow-lg"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-100 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="max-w-7xl w-full px-6 -mt-8 relative z-20 flex flex-col gap-8">
        
        {/* BARRA DE FERRAMENTAS */}
        <div className="bg-white rounded-2xl p-4 shadow-lg shadow-tertiary/5 border border-tertiary/5 flex flex-col lg:flex-row justify-between items-center gap-4">
          
          {/* Filtro de Categoria */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide mask-linear-fade">
            <span className="text-xs font-bold text-tertiary uppercase tracking-wider mr-2 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Filtrar:
            </span>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
                  selectedCategory === cat
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100 hover:border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Toggle View */}
          <div className="flex items-center bg-gray-100 p-1.5 rounded-xl border border-gray-200 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- GRID / LISTA --- */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32 text-tertiary">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <span className="font-medium text-primary">Cultivando catálogo...</span>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
          }>
            
            {/* CARD DE ADICIONAR (ADMIN ONLY) */}
            {isAdmin && viewMode === "grid" && (
              <div
                onClick={() => setIsCreateModalOpen(true)}
                className="group flex flex-col items-center justify-center min-h-[380px] bg-white border-2 border-dashed border-primary/20 rounded-3xl cursor-pointer hover:border-primary hover:bg-green-50/50 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-stripe-pattern opacity-5"></div>
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white text-primary transition-all duration-300 shadow-sm">
                  <Plus className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-xl text-primary mb-1">Nova Planta</h3>
                <p className="text-sm text-tertiary">Adicionar ao catálogo</p>
              </div>
            )}

            {/* BOTÃO ADICIONAR (LISTA MODE) */}
            {isAdmin && viewMode === "list" && (
                <Button onClick={() => setIsCreateModalOpen(true)} className="w-full py-6 border-2 border-dashed border-primary/20 bg-white hover:bg-green-50 text-primary hover:text-primary mb-4 flex gap-2">
                    <Plus className="w-5 h-5" /> Adicionar Nova Planta
                </Button>
            )}

            {/* LISTAGEM */}
            {filteredPlantas.length > 0 ? (
              filteredPlantas.map((planta) => (
                <div
                  key={planta.id}
                  onClick={() => setSelectedPlant(planta)}
                  className={`
                    group bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-tertiary/10 transition-all duration-300 border border-tertiary/5 cursor-pointer overflow-hidden relative
                    ${viewMode === "grid" ? "flex flex-col hover:-translate-y-1" : "flex flex-row items-center h-32 hover:translate-x-1"}
                  `}
                >
                  {/* Imagem */}
                  <div className={`
                    relative overflow-hidden bg-gray-100 flex items-center justify-center
                    ${viewMode === "grid" ? "w-full aspect-[4/3]" : "w-32 h-full shrink-0"}
                  `}>
                    {planta.img_url && planta.img_url.length > 10 ? (
                      <img
                        src={planta.img_url}
                        alt={planta.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <Leaf className="w-12 h-12 text-gray-300/50" />
                    )}
                    
                    {/* Badge Categoria */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-white/95 backdrop-blur-md text-primary px-3 py-1.5 rounded-lg shadow-sm">
                        {planta.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className={`flex flex-col justify-center ${viewMode === "grid" ? "p-6" : "p-4 w-full"}`}>
                    <h3 className="font-bold text-lg text-primary leading-tight mb-1 group-hover:text-secondary transition-colors">
                      {planta.nome}
                    </h3>
                    <p className="text-xs text-tertiary italic font-serif mb-4">
                      {planta.nome_cientifico}
                    </p>
                    
                    {viewMode === "grid" && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-6 leading-relaxed">
                        {planta.descricao}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-auto border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium" title="Rega">
                            <Droplets className="w-3.5 h-3.5 text-blue-400" /> 
                            {planta.periodicidade_rega}d
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium" title="Luz">
                             <Sun className="w-3.5 h-3.5 text-amber-400" />
                             Sol
                        </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center flex flex-col items-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <Leaf className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600">Nenhuma planta encontrada</h3>
                <p className="text-sm text-gray-400 mt-1 mb-4">Tente ajustar seus filtros ou busca.</p>
                <button 
                    onClick={() => {setSearchTerm(""); setSelectedCategory("Todas")}}
                    className="text-primary font-bold hover:underline text-sm"
                >
                    Limpar todos os filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL DE DETALHES (Estilo Ficha Técnica) --- */}
      {selectedPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm transition-opacity" onClick={() => setSelectedPlant(null)} />
            
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300">
                <button 
                    onClick={() => setSelectedPlant(null)}
                    className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-all hover:rotate-90"
                >
                    <X className="w-5 h-5 text-gray-700" />
                </button>

                {/* Coluna Visual */}
                <div className="w-full md:w-5/12 bg-gray-100 relative h-64 md:h-auto">
                    {selectedPlant.img_url && selectedPlant.img_url.length > 10 ? (
                        <img src={selectedPlant.img_url} alt={selectedPlant.nome} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-quinquenary/20">
                            <Leaf className="w-24 h-24 mb-4" />
                            <span className="text-sm font-medium">Sem imagem disponível</span>
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                        <div className="text-white">
                             <span className="text-xs font-bold uppercase tracking-widest bg-primary/80 backdrop-blur-md px-3 py-1 rounded-lg">
                                {selectedPlant.categoria}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Coluna Dados */}
                <div className="w-full md:w-7/12 p-8 md:p-10 overflow-y-auto bg-white custom-scrollbar">
                    <div className="mb-8 border-b border-gray-100 pb-6">
                        <h2 className="text-4xl font-bold text-primary mb-2">{selectedPlant.nome}</h2>
                        <div className="flex items-center gap-2 text-tertiary">
                            <span className="italic font-serif text-lg text-secondary">{selectedPlant.nome_cientifico}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-sm">Família {selectedPlant.familia}</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Sprout className="w-4 h-4" /> Sobre a Espécie
                            </h4>
                            <p className="text-gray-600 leading-relaxed text-justify">{selectedPlant.descricao}</p>
                        </div>

                        <div className="bg-[#FFF8F0] p-6 rounded-2xl border border-orange-100/50">
                            <h4 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-3">
                                <Sun className="w-4 h-4" /> Guia de Cuidados
                            </h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{selectedPlant.instrucoes_cuidado}</p>
                        </div>

                        {/* Cards de Periodicidade */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 hover:bg-blue-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-2">
                                    <Droplets className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] uppercase font-bold text-blue-400 mb-1">Rega</span>
                                <span className="text-lg font-bold text-blue-700">{selectedPlant.periodicidade_rega} <span className="text-xs font-normal">dias</span></span>
                            </div>
                            
                            <div className="flex flex-col items-center p-4 bg-green-50/50 rounded-2xl border border-green-100/50 hover:bg-green-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                                    <Scissors className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] uppercase font-bold text-green-500 mb-1">Poda</span>
                                <span className="text-lg font-bold text-green-700">{selectedPlant.periodicidade_poda} <span className="text-xs font-normal">dias</span></span>
                            </div>

                            <div className="flex flex-col items-center p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 hover:bg-amber-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
                                    <Leaf className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] uppercase font-bold text-amber-500 mb-1">Adubo</span>
                                <span className="text-lg font-bold text-amber-700">{selectedPlant.periodicidade_adubo} <span className="text-xs font-normal">dias</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL DE CRIAR (Admin) --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCreateModalOpen(false)} />
          
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300 relative z-10">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Adicionar Nova Planta
                    </h2>
                    <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 custom-scrollbar">
                    <form id="create-plant-form" onSubmit={handleCreatePlant} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-2 md:col-span-1 space-y-1.5">
                            <label className="text-xs font-bold text-primary/70 uppercase">Nome Popular</label>
                            <input required name="nome" value={newPlant.nome} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Ex: Costela de Adão" />
                        </div>
                        <div className="col-span-2 md:col-span-1 space-y-1.5">
                            <label className="text-xs font-bold text-primary/70 uppercase">Nome Científico</label>
                            <input required name="nome_cientifico" value={newPlant.nome_cientifico} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Ex: Monstera deliciosa" />
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-primary/70 uppercase">Categoria</label>
                            <select name="categoria" value={newPlant.categoria} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                            {CATEGORIAS.filter(c => c !== "Todas").map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-primary/70 uppercase">Família</label>
                            <input name="familia" value={newPlant.familia} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                        </div>
                        
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-xs font-bold text-primary/70 uppercase flex items-center gap-2">
                                <ImageIcon className="w-3 h-3" /> URL da Imagem
                            </label>
                            <input name="img_url" value={newPlant.img_url} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="https://exemplo.com/imagem.jpg" />
                        </div>
                        
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-xs font-bold text-primary/70 uppercase">Descrição</label>
                            <textarea name="descricao" value={newPlant.descricao} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" rows={3} placeholder="Breve descrição da planta..." />
                        </div>
                        
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-xs font-bold text-primary/70 uppercase">Instruções de Cuidado</label>
                            <textarea name="instrucoes_cuidado" value={newPlant.instrucoes_cuidado} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" rows={3} placeholder="Como cuidar (sol, ambiente, etc)..." />
                        </div>

                        <div className="col-span-2 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                            <p className="text-xs font-bold text-primary mb-4 uppercase tracking-widest flex items-center gap-2">
                                <Droplets className="w-3 h-3" /> Configuração de Alertas (dias)
                            </p>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Rega</label>
                                    <input type="number" min="1" name="periodicidade_rega" value={newPlant.periodicidade_rega} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg text-center font-bold text-gray-700 focus:border-primary outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Poda</label>
                                    <input type="number" min="1" name="periodicidade_poda" value={newPlant.periodicidade_poda} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg text-center font-bold text-gray-700 focus:border-primary outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Adubo</label>
                                    <input type="number" min="1" name="periodicidade_adubo" value={newPlant.periodicidade_adubo} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg text-center font-bold text-gray-700 focus:border-primary outline-none" />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700 hover:bg-gray-200/50">Cancelar</Button>
                    <Button type="submit" form="create-plant-form" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-6 rounded-xl" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {isSubmitting ? "Salvando..." : "Cadastrar Planta"}
                    </Button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL DE SUCESSO (Feedback) --- */}
      <AlertModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onConfirm={() => setIsSuccessModalOpen(false)}
        title="Planta Cadastrada!"
        description={`A espécie "${newPlant.nome}" foi adicionada ao catálogo com sucesso. Agora os usuários podem adicioná-la aos seus jardins.`}
        variant="success"
        confirmText="Concluir"
        cancelText="Fechar"
      />

    </div>
  );
}