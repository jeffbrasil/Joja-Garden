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
  Sun 
} from "lucide-react";
import { catalogoService } from "@/services/catalogoService";
import { IPlanta } from "@/types";
import { useAuth } from "@/context/AuthContext";

// Definição das categorias para o filtro
const CATEGORIAS = ["Todas", "Ornamental", "Frutífera", "Hortaliça", "Erva Medicinal"];

export default function CatalogoPage() {
  const [plantas, setPlantas] = useState<IPlanta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  // --- ESTADOS DE CONTROLE DE UI & FILTROS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // --- ESTADOS DOS MODAIS ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Modal de Admin (Criar)
  const [selectedPlant, setSelectedPlant] = useState<IPlanta | null>(null); // Modal de Detalhes (Leitura)
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
      setIsCreateModalOpen(false);
      fetchPlantas();
      setNewPlant(initialFormState);
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar planta.");
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
    <div className="flex flex-col items-center w-full min-h-screen pb-10 relative bg-gray-50/30">
      
      {/* --- HEADER (Estilo Dark / Subheader Escuro) --- */}
      <div className="w-full bg-primary shadow-lg shadow-primary/20 py-10 px-6 md:px-12 mb-8 rounded-b-[2.5rem]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Catálogo Botânico
            </h1>
            <p className="text-green-100/80 mt-2 text-lg font-light">
              Explore nossa coleção e encontre a companhia perfeita.
            </p>
          </div>

          {/* Barra de Pesquisa */}
          <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-5 py-3 w-full md:w-96 border border-white/20 focus-within:bg-white/20 focus-within:border-white/40 transition-all">
            <Search className="text-green-100 w-5 h-5 mr-3" />
            <input
              type="text"
              placeholder="Buscar por nome ou espécie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-white placeholder-green-100/60 w-full text-sm font-medium"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-green-100 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="max-w-7xl w-full px-6 flex flex-col gap-6">
        
        {/* BARRA DE FERRAMENTAS (Filtros e View Mode) */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          
          {/* Filtro de Categoria */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            <span className="text-sm font-semibold text-gray-500 mr-2 flex items-center gap-1">
              <Filter className="w-4 h-4" /> Categoria:
            </span>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Toggle Grade/Lista */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- GRID / LISTA DE PLANTAS --- */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-tertiary">
            <Loader2 className="w-8 h-8 animate-spin mr-2 text-primary" />
            <span className="font-medium text-primary">Carregando catálogo...</span>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
          }>
            
            {/* CARD DE ADICIONAR (Exclusivo Admin) - Só aparece na Grid ou como botão no topo se for Lista */}
            {isAdmin && viewMode === "grid" && (
              <div
                onClick={() => setIsCreateModalOpen(true)}
                className="group flex flex-col items-center justify-center min-h-[350px] bg-white border-2 border-dashed border-tertiary/30 rounded-2xl cursor-pointer hover:border-primary hover:bg-green-50/30 transition-all duration-300"
              >
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-primary">Adicionar Planta</h3>
                <p className="text-xs text-tertiary mt-1">Cadastrar novo item</p>
              </div>
            )}

            {/* Renderização das Plantas */}
            {filteredPlantas.length > 0 ? (
              filteredPlantas.map((planta) => (
                <div
                  key={planta.id}
                  onClick={() => setSelectedPlant(planta)}
                  className={`
                    group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden
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
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Leaf className="w-12 h-12 text-gray-300" />
                    )}
                    
                    {/* Badge de Categoria */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-white/90 backdrop-blur-sm text-primary px-2 py-1 rounded-full shadow-sm">
                        {planta.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className={`flex flex-col justify-center ${viewMode === "grid" ? "p-5" : "p-4 w-full"}`}>
                    <h3 className="font-bold text-lg text-gray-800 leading-tight group-hover:text-primary transition-colors">
                      {planta.nome}
                    </h3>
                    <p className="text-sm text-gray-500 italic mb-2">
                      {planta.nome_cientifico}
                    </p>
                    
                    {viewMode === "grid" && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {planta.descricao}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-auto text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><Droplets className="w-3 h-3" /> {planta.periodicidade_rega}d</span>
                        <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> Sol/Sombra</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400 flex flex-col items-center">
                <Leaf className="w-12 h-12 mb-3 opacity-20" />
                <p>Nenhuma planta encontrada para os filtros selecionados.</p>
                <button 
                    onClick={() => {setSearchTerm(""); setSelectedCategory("Todas")}}
                    className="text-primary hover:underline mt-2 text-sm"
                >
                    Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL DE DETALHES (Somente Leitura) --- */}
      {selectedPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedPlant(null)} />
            
            {/* Conteúdo Modal */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setSelectedPlant(null)}
                    className="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-700" />
                </button>

                {/* Coluna Imagem */}
                <div className="w-full md:w-2/5 bg-gray-100 relative h-64 md:h-auto">
                    {selectedPlant.img_url && selectedPlant.img_url.length > 10 ? (
                        <img src={selectedPlant.img_url} alt={selectedPlant.nome} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Leaf className="w-20 h-20" />
                        </div>
                    )}
                </div>

                {/* Coluna Informações */}
                <div className="w-full md:w-3/5 p-8 overflow-y-auto">
                    <div className="mb-6">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary bg-green-50 px-3 py-1 rounded-full">
                            {selectedPlant.categoria}
                        </span>
                        <h2 className="text-3xl font-bold text-gray-800 mt-3">{selectedPlant.nome}</h2>
                        <p className="text-lg text-gray-500 italic font-serif">{selectedPlant.nome_cientifico}</p>
                        <p className="text-sm text-gray-400 mt-1">Família: {selectedPlant.familia}</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                                <Sprout className="w-4 h-4 text-primary" /> Sobre
                            </h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{selectedPlant.descricao}</p>
                        </div>

                        <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                            <h4 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-2">
                                <Sun className="w-4 h-4" /> Cuidados & Instruções
                            </h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{selectedPlant.instrucoes_cuidado}</p>
                        </div>

                        {/* Grid de Periodicidade */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
                                <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                <span className="block text-xs text-gray-500 uppercase font-bold">Rega</span>
                                <span className="text-sm font-semibold text-blue-700">A cada {selectedPlant.periodicidade_rega} dias</span>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                                <Scissors className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                <span className="block text-xs text-gray-500 uppercase font-bold">Poda</span>
                                <span className="text-sm font-semibold text-green-700">{selectedPlant.periodicidade_poda} dias</span>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-lg text-center border border-amber-100">
                                <Leaf className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                                <span className="block text-xs text-gray-500 uppercase font-bold">Adubo</span>
                                <span className="text-sm font-semibold text-amber-700">{selectedPlant.periodicidade_adubo} dias</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL DE CRIAR (Admin) --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-primary">Nova Planta no Catálogo</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePlant} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Inputs do formulário (Mantive a lógica anterior, apenas ajustando visual se necessário) */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Popular</label>
                <input required name="nome" value={newPlant.nome} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: Rosa" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Científico</label>
                <input required name="nome_cientifico" value={newPlant.nome_cientifico} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                <select name="categoria" value={newPlant.categoria} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  {CATEGORIAS.filter(c => c !== "Todas").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Família</label>
                <input name="familia" value={newPlant.familia} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL da Imagem</label>
                <input name="img_url" value={newPlant.img_url} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="https://..." />
              </div>
              
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                <textarea name="descricao" value={newPlant.descricao} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" rows={3} />
              </div>
              
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instruções de Cuidado</label>
                <textarea name="instrucoes_cuidado" value={newPlant.instrucoes_cuidado} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" rows={3} />
              </div>

              <div className="grid grid-cols-3 gap-2 col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="col-span-3 text-xs font-bold text-gray-500 mb-2">PERIODICIDADE (DIAS)</p>
                <div>
                    <label className="text-[10px] text-gray-400">Rega</label>
                    <input type="number" name="periodicidade_rega" value={newPlant.periodicidade_rega} onChange={handleInputChange} className="w-full p-1 border rounded" />
                </div>
                <div>
                    <label className="text-[10px] text-gray-400">Poda</label>
                    <input type="number" name="periodicidade_poda" value={newPlant.periodicidade_poda} onChange={handleInputChange} className="w-full p-1 border rounded" />
                </div>
                <div>
                    <label className="text-[10px] text-gray-400">Adubo</label>
                    <input type="number" name="periodicidade_adubo" value={newPlant.periodicidade_adubo} onChange={handleInputChange} className="w-full p-1 border rounded" />
                </div>
              </div>

              <div className="col-span-2 pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-primary text-white" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar Planta"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}