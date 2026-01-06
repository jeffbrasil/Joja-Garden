"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, Heart, Plus, Loader2, X, Leaf } from "lucide-react"; // Adicionei Leaf
import { catalogoService } from "@/services/catalogoService";
import { IPlanta } from "@/types";
import { useAuth } from "@/context/AuthContext";

export default function CatalogoPage() {
  const [plantas, setPlantas] = useState<IPlanta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado inicial do form
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

  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await catalogoService.create(newPlant);
      setIsModalOpen(false);
      fetchPlantas();
      setNewPlant(initialFormState);
      // Opcional: Adicionar um toast de sucesso aqui
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar planta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setNewPlant((prev) => ({
      ...prev,
      [name]: name.includes("periodicidade") ? Number(value) : value,
    }));
  };

  console.log("=== DEBUG ADMIN ===");
  console.log("Usuário logado:", user);
  console.log("Tipo do usuário:", user?.tipo_usuario);
  console.log("É Admin?", isAdmin);
  console.log("===================");

  return (
    <div className="flex flex-col items-center w-full h-auto pb-10 relative">
      {/* --- HEADER (Sem o botão de adicionar) --- */}
      <div className="w-full bg-quaternary shadow-sm shadow-tertiary/20 py-8 px-6 md:px-12 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Catálogo de Plantas
            </h1>
            <p className="text-tertiary mt-1">
              Encontre a planta perfeita para o seu jardim.
            </p>
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
            <Button
              variant="outline"
              className="border-secondary text-secondary rounded-full h-8 text-xs px-4"
            >
              Todas
            </Button>
          </div>
          <button className="flex items-center gap-2 text-primary font-medium text-sm hover:opacity-80">
            <Filter className="w-4 h-4" /> Filtrar
          </button>
        </div>

        {/* --- GRID MISTO (Botão Admin + Plantas) --- */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-tertiary">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Carregando catálogo...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* 1. CARD DE ADICIONAR (Exclusivo Admin) */}
            {isAdmin && (
              <div
                onClick={() => setIsModalOpen(true)}
                className="group flex flex-col items-center justify-center min-h-[380px] bg-white border-2 border-dashed border-tertiary/40 rounded-xl cursor-pointer hover:border-primary hover:bg-green-50/50 transition-all duration-300"
              >
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-primary">
                  Adicionar Planta
                </h3>
                <p className="text-xs text-tertiary mt-1">
                  Cadastrar novo item no catálogo
                </p>
              </div>
            )}

            {/* 2. LISTA DE PLANTAS */}
            {plantas.map((planta, index) => (
              <div
                key={planta.id || index}
                className="group bg-quaternary rounded-xl p-4 shadow-md shadow-tertiary/10 hover:shadow-xl hover:shadow-tertiary/20 transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-tertiary/30 cursor-pointer flex flex-col min-h-[380px]"
              >
                {/* Imagem (ou Fallback da Plantinha) */}
                <div className="relative w-full aspect-[4/5] bg-quinquenary rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                  {planta.img_url && planta.img_url !== "string" ? (
                    <img
                      src={planta.img_url}
                      alt={planta.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Aqui está a "plantinha" que você perguntou
                    <Leaf className="w-16 h-16 text-tertiary/40" />
                  )}

                  <button className="absolute top-3 right-3 p-2 bg-quaternary rounded-full shadow-sm text-tertiary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Dados da Planta */}
                <div className="flex flex-col gap-1 mb-3">
                  <h3
                    className="font-semibold text-lg text-primary leading-tight line-clamp-1"
                    title={planta.nome}
                  >
                    {planta.nome}
                  </h3>
                  <p className="text-xs text-tertiary italic">
                    {planta.nome_cientifico}
                  </p>
                </div>

                <div className="flex gap-2 mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-quinquenary text-secondary px-2 py-1 rounded-sm">
                    {planta.categoria}
                  </span>
                </div>

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

      {/* --- MODAL (Mantive igual) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-primary">
                Nova Planta no Catálogo
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleCreatePlant}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Campos do formulário... (estão iguais ao anterior) */}
              {/* Vou abreviar aqui para não ficar gigante na resposta,
                   mas use o mesmo form que te mandei antes */}

              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Popular
                </label>
                <input
                  required
                  name="nome"
                  value={newPlant.nome}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Ex: Rosa"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Científico
                </label>
                <input
                  required
                  name="nome_cientifico"
                  value={newPlant.nome_cientifico}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  name="categoria"
                  value={newPlant.categoria}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  <option value="Ornamental">Ornamental</option>
                  <option value="Frutífera">Frutífera</option>
                  <option value="Hortaliça">Hortaliça</option>
                  <option value="Erva Medicinal">Erva Medicinal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Família
                </label>
                <input
                  name="familia"
                  value={newPlant.familia}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Imagem
                </label>
                <input
                  name="img_url"
                  value={newPlant.img_url}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://..."
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={newPlant.descricao}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instruções
                </label>
                <textarea
                  name="instrucoes_cuidado"
                  value={newPlant.instrucoes_cuidado}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 col-span-2 bg-gray-50 p-3 rounded-md">
                <p className="col-span-3 text-xs font-semibold text-gray-500 mb-1">
                  Periodicidade (dias)
                </p>
                <input
                  type="number"
                  placeholder="Rega"
                  name="periodicidade_rega"
                  value={newPlant.periodicidade_rega}
                  onChange={handleInputChange}
                  className="w-full p-1 border rounded"
                />
                <input
                  type="number"
                  placeholder="Poda"
                  name="periodicidade_poda"
                  value={newPlant.periodicidade_poda}
                  onChange={handleInputChange}
                  className="w-full p-1 border rounded"
                />
                <input
                  type="number"
                  placeholder="Adubo"
                  name="periodicidade_adubo"
                  value={newPlant.periodicidade_adubo}
                  onChange={handleInputChange}
                  className="w-full p-1 border rounded"
                />
              </div>

              <div className="col-span-2 pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-white"
                  disabled={isSubmitting}
                >
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
