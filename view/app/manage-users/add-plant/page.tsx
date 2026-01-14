"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  ArrowLeft,
  Search,
  Leaf,
  Loader2,
  Sprout,
  Calendar,
  X,
  Frown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { catalogoService } from "@/services/catalogoService";
import { IPlanta } from "@/types";
import { AlertModal } from "@/components/modals/alert-modal";

// 2. MUDEI O NOME AQUI E TIREI O 'export default'
function AddPlantContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin } = useAuth();

  // Dados do Usuário Alvo
  const targetIdStr = searchParams.get("id");
  const targetNome = searchParams.get("nome");
  const targetId = targetIdStr ? parseInt(targetIdStr) : null;

  // Estados de Dados
  const [catalogo, setCatalogo] = useState<IPlanta[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [busca, setBusca] = useState("");
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({}); // Rastreia imagens quebradas

  // Estado do Modal de Formulário (Seleção)
  const [selectedPlant, setSelectedPlant] = useState<IPlanta | null>(null);
  const [apelido, setApelido] = useState("");
  const [dataPlantio, setDataPlantio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado do AlertModal (Feedback)
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "danger" | "warning" | "success" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "info",
    onConfirm: () => {},
  });

  // Função auxiliar para fechar o AlertModal
  const closeAlert = () =>
    setAlertState((prev) => ({ ...prev, isOpen: false }));

  // 1. Verificação de Segurança
  useEffect(() => {
    if (!isAdmin) return;

    if (!targetId || !targetNome) {
      setAlertState({
        isOpen: true,
        title: "Dados Insuficientes",
        description: "Nenhum usuário foi selecionado para receber a planta.",
        variant: "warning",
        onConfirm: () => router.push("/manage-users"),
      });
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

  // Filtragem
  const plantasFiltradas = catalogo.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.nome_cientifico?.toLowerCase().includes(busca.toLowerCase()),
  );

  // Handler de erro de imagem
  const handleImageError = (id: number) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Abrir Modal de Formulário
  const handleSelectPlant = (planta: IPlanta) => {
    setSelectedPlant(planta);
    setApelido(planta.nome);
    setDataPlantio(new Date().toISOString().split("T")[0]);
  };

  // Enviar para o Backend
  const handleConfirmAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || !selectedPlant) return;

    setIsSubmitting(true);
    try {
      await userService.addPlantToUser(targetId, {
        id: selectedPlant.id!,
        apelido: apelido,
        data_plantio: dataPlantio,
      });

      // Fecha o modal de formulário
      setSelectedPlant(null);

      // Abre o modal de Sucesso
      setAlertState({
        isOpen: true,
        title: "Planta Adicionada!",
        description: `A planta "${selectedPlant.nome}" foi adicionada com sucesso ao jardim de ${targetNome}.`,
        variant: "success",
        onConfirm: () => router.push("/manage-users"), // Redireciona ao confirmar
      });
    } catch (error) {
      console.error("Erro ao adicionar planta:", error);

      // Abre o modal de Erro (mantém o formulário aberto se quiser, ou fecha)
      setAlertState({
        isOpen: true,
        title: "Erro na Adição",
        description:
          "Não foi possível adicionar a planta. Verifique sua conexão e tente novamente.",
        variant: "danger",
        onConfirm: closeAlert,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-50/50 pb-10 font-poppins relative">
      {/* --- HEADER --- */}
      <div className="w-full bg-white border-b border-gray-200 py-6 px-6 md:px-12 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-tertiary hover:text-primary hover:bg-gray-100 rounded-full h-10 w-10 p-0 flex items-center justify-center transition-all"
            >
              <ArrowLeft size={22} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Sprout className="w-6 h-6 text-green-600" /> Adicionar Planta
              </h1>
              <p className="text-tertiary text-sm mt-1">
                Jardim de:{" "}
                <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded ml-1">
                  {targetNome}
                </span>
              </p>
            </div>
          </div>

          {/* Barra de Busca Estilizada */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary w-4 h-4 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar no catálogo..."
              className="w-full bg-gray-100 border border-transparent focus:bg-white focus:border-primary/30 rounded-full py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* --- GRID DE PLANTAS --- */}
      <div className="max-w-6xl w-full px-6">
        {loadingCatalogo ? (
          <div className="flex flex-col items-center justify-center py-20 text-tertiary">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p>Carregando catálogo...</p>
          </div>
        ) : plantasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-tertiary opacity-70">
            <Frown className="w-12 h-12 mb-2" />
            <p>Nenhuma planta encontrada para "{busca}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {plantasFiltradas.map((planta) => (
              <div
                key={planta.id}
                className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col h-full relative"
                onClick={() => handleSelectPlant(planta)}
              >
                {/* Imagem */}
                <div className="h-44 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                  {planta.img_url && !imgErrors[planta.id || 0] ? (
                    <img
                      src={planta.img_url}
                      alt={planta.nome}
                      onError={() => planta.id && handleImageError(planta.id)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <Leaf className="w-12 h-12 text-green-200" />
                  )}

                  {/* Overlay de Seleção */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Button
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-primary hover:bg-white hover:text-green-700 font-bold shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Selecionar
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-primary transition-colors">
                      {planta.nome}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 italic mb-3">
                    {planta.nome_cientifico}
                  </p>

                  <div className="mt-auto">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-[10px] uppercase font-bold tracking-wide border border-green-100">
                      {planta.categoria}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL DE FORMULÁRIO (Configuração da Planta) --- */}
      {selectedPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <Sprout className="w-5 h-5 text-green-600" /> Configurar Planta
              </h3>
              <button
                onClick={() => setSelectedPlant(null)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmAdd} className="p-6 space-y-5">
              {/* Resumo da Seleção */}
              <div className="bg-green-50/50 p-4 rounded-xl flex items-center gap-4 border border-green-100/50">
                <div className="h-12 w-12 rounded-lg bg-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                  {selectedPlant.img_url &&
                  !imgErrors[selectedPlant.id || 0] ? (
                    <img
                      src={selectedPlant.img_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Leaf className="w-6 h-6 text-green-500" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-green-600 uppercase font-bold tracking-wider">
                    Adicionando
                  </p>
                  <p className="font-bold text-green-900 text-lg leading-none">
                    {selectedPlant.nome}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="apelido"
                    className="text-gray-700 font-medium"
                  >
                    Apelido (Opcional)
                  </Label>
                  <Input
                    id="apelido"
                    value={apelido}
                    onChange={(e) => setApelido(e.target.value)}
                    placeholder={`Ex: ${selectedPlant.nome} da Sala`}
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-all"
                  />
                  <p className="text-[11px] text-gray-400">
                    Nome carinhoso que o usuário verá no painel dele.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data" className="text-gray-700 font-medium">
                    Data do Plantio
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="data"
                      type="date"
                      value={dataPlantio}
                      onChange={(e) => setDataPlantio(e.target.value)}
                      className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all block w-full"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  onClick={() => setSelectedPlant(null)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <Plus size={16} /> Adicionar
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ALERT MODAL (Feedback Global) --- */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        onConfirm={alertState.onConfirm}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
        loading={false}
        confirmText={
          alertState.variant === "success" ? "Concluir" : "Entendido"
        }
        cancelText={
          alertState.variant === "success" ? "Adicionar outra" : "Fechar"
        }
      />
    </div>
  );
}

export default function AddPlantToUserPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        </div>
      }
    >
      <AddPlantContent />
    </Suspense>
  );
}
