"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  User,
  Shield,
  Leaf,
  Loader2,
  AlertCircle,
  Mail,
  Hash,
  Trash2,
  ChevronRight,
  X,
  AlertTriangle,
  Key,
  Eye,
  EyeOff
} from "lucide-react";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { IUser } from "@/types";
import { toast } from "sonner";

export default function ManageUsersPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  
  // Estados de busca
  const [cpfBusca, setCpfBusca] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Estados de deleção e Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Função auxiliar para máscara visual (enquanto digita)
  const formatarCpfVisual = (valor: string) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .slice(0, 14);
  };

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfBusca) return;

    setIsLoading(true);
    setErro("");
    setUsuarioEncontrado(null);

    const apenasNumeros = cpfBusca.replace(/\D/g, "");

    if (apenasNumeros.length !== 11) {
      setErro("CPF incompleto. Digite os 11 números.");
      setIsLoading(false);
      return;
    }

    const cpfFormatado = apenasNumeros.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4",
    );

    try {
      const data = await userService.getUserByCpf(cpfFormatado);
      setUsuarioEncontrado(data);
    } catch (error: any) {
      console.error("Erro ao buscar:", error);
      if (error.response?.status === 404) {
        setErro(`Usuário não encontrado.`);
      } else {
        setErro("Erro ao buscar usuário.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDeleteModal = () => {
    if (!usuarioEncontrado) return;
    setConfirmacaoSenha("");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!usuarioEncontrado) return;

    // Validação Visual da Senha (UX Guardrail)
    if (!confirmacaoSenha) {
      toast.warning("Digite sua senha de administrador para confirmar.");
      return;
    }

    setIsDeleting(true);
    try {
      // Chama o endpoint DELETE /usuario/{id}
      await userService.deleteUser(usuarioEncontrado.id);
      
      toast.success(`Usuário ${usuarioEncontrado.nome} excluído com sucesso.`);
      
      // Limpa os estados após sucesso
      setUsuarioEncontrado(null);
      setCpfBusca("");
      setIsDeleteModalOpen(false);
      
    } catch (error: any) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao excluir usuário. Verifique se o usuário possui pendências.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-tertiary">
        <Shield className="w-20 h-20 mb-6 text-red-200" />
        <h2 className="text-2xl font-bold text-primary">Acesso Restrito</h2>
        <p className="text-tertiary/80 mt-2">
          Você precisa ser administrador para ver esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative">
      {/* --- CABEÇALHO DARK (Identidade Visual do Catálogo) --- */}
      <div className="bg-primary pt-12 pb-24 px-6 md:px-12 shadow-lg">
        <div className="max-w-5xl mx-auto text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            {/* Títulos */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium backdrop-blur-sm border border-white/10">
                <Shield className="w-3 h-3" />
                <span>Área Administrativa</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Gerenciar Usuários
              </h1>
              <p className="text-white/60 max-w-lg">
                Busque usuários pelo CPF para gerenciar seus jardins, adicionar
                plantas ou realizar manutenções de conta.
              </p>
            </div>

            {/* Barra de Busca Flutuante */}
            <div className="w-full md:w-[450px]">
              <form onSubmit={handleBuscar} className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-tertiary group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  value={cpfBusca}
                  onChange={(e) =>
                    setCpfBusca(formatarCpfVisual(e.target.value))
                  }
                  placeholder="Buscar CPF..."
                  maxLength={14}
                  className="w-full h-14 pl-12 pr-32 rounded-2xl bg-white border-0 shadow-xl shadow-black/5 text-primary placeholder:text-tertiary/50 focus:ring-2 focus:ring-secondary/50 transition-all text-base"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-2 bottom-2 rounded-xl bg-primary hover:bg-secondary text-white px-6 font-medium transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Buscar"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL (Overlap no Header) --- */}
      <div className="flex-1 px-6 -mt-12 mb-20">
        <div className="max-w-4xl mx-auto">
          {/* Mensagem de Erro */}
          {erro && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{erro}</span>
            </div>
          )}

          {/* ESTADO VAZIO (Inicial) */}
          {!usuarioEncontrado && !isLoading && !erro && (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 text-center border border-dashed border-tertiary/20 shadow-sm">
              <div className="w-20 h-20 bg-quaternary/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-tertiary/40" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Nenhum usuário selecionado
              </h3>
              <p className="text-tertiary max-w-sm mx-auto">
                Utilize a barra de busca acima digitando o CPF para carregar as
                informações do usuário.
              </p>
            </div>
          )}

          {/* CARD DO USUÁRIO (Resultado) */}
          {usuarioEncontrado && (
            <div className="bg-white rounded-3xl shadow-xl shadow-tertiary/10 overflow-hidden border border-tertiary/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Topo do Card */}
              <div className="bg-gradient-to-r from-quaternary to-white p-8 border-b border-tertiary/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-tertiary/10">
                        <User className="w-10 h-10 text-primary" />
                      </div>
                      {usuarioEncontrado.tipo_usuario?.toLowerCase() ===
                        "admin" && (
                        <div
                          className="absolute -top-2 -right-2 bg-primary text-white p-1.5 rounded-full shadow-sm"
                          title="Administrador"
                        >
                          <Shield className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-primary">
                        {usuarioEncontrado.nome}
                      </h2>
                      <div className="flex items-center gap-2 mt-2 text-sm text-tertiary">
                        <span className="bg-secondary/10 text-primary/80 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                          ID: {usuarioEncontrado.id}
                        </span>
                        <span>•</span>
                        <span>Cadastrado no sistema</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Corpo do Card */}
              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                {/* Coluna 1: Informações (Ocupa 2 colunas no desktop) */}
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-tertiary uppercase tracking-widest mb-4 flex items-center gap-2">
                      <User className="w-4 h-4" /> Dados Pessoais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-secondary/30 transition-colors">
                        <div className="flex items-center gap-3 mb-1">
                          <Hash className="w-4 h-4 text-tertiary" />
                          <span className="text-xs font-semibold text-tertiary uppercase">
                            CPF
                          </span>
                        </div>
                        <p className="text-primary font-medium text-lg ml-7">
                          {cpfBusca}
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-secondary/30 transition-colors">
                        <div className="flex items-center gap-3 mb-1">
                          <Mail className="w-4 h-4 text-tertiary" />
                          <span className="text-xs font-semibold text-tertiary uppercase">
                            E-mail
                          </span>
                        </div>
                        <p
                          className="text-primary font-medium text-lg ml-7 truncate"
                          title={usuarioEncontrado.email}
                        >
                          {usuarioEncontrado.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Ações (Barra Lateral) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-tertiary uppercase tracking-widest mb-4">
                    Ações Rápidas
                  </h3>

                  <Button
                    onClick={() => {
                      router.push(
                        `/manage-users/add-plant?id=${usuarioEncontrado.id}&nome=${encodeURIComponent(usuarioEncontrado.nome)}`,
                      );
                    }}
                    className="w-full h-auto py-4 justify-between bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 group transition-all"
                  >
                    <span className="flex items-center gap-3">
                      <span className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                        <Leaf className="w-5 h-5" />
                      </span>
                      <span className="font-semibold text-left">
                        Adicionar Planta
                        <span className="block text-[10px] font-normal opacity-80">
                          Vincular nova planta
                        </span>
                      </span>
                    </span>
                    <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <div className="h-px bg-tertiary/10 my-2"></div>

                  <Button
                    variant="outline"
                    onClick={handleOpenDeleteModal}
                    className="w-full h-auto py-4 justify-start border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-xl group transition-all"
                  >
                    <span className="bg-red-100 p-2 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </span>
                    <span className="font-semibold text-left">
                      Deletar Usuário
                      <span className="block text-[10px] font-normal opacity-70">
                        Ação irreversível
                      </span>
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (IGUAL ADMIN) --- */}
      {isDeleteModalOpen && usuarioEncontrado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             
             {/* Header do Modal */}
             <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100 relative">
                <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-900">Excluir Usuário?</h2>
                <p className="text-red-700/80 text-sm mt-2">
                  Você está prestes a excluir a conta de <strong>{usuarioEncontrado.nome}</strong>. Isso apagará todos os jardins e plantas vinculados permanentemente.
                </p>
             </div>

             {/* Corpo do Modal */}
             <div className="p-6 space-y-5">
                <div className="space-y-2">
                   <label className="text-sm font-semibold text-tertiary ml-1 flex items-center gap-2">
                      <Key className="w-3 h-3" /> Confirme com sua senha de Admin
                   </label>
                   <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha..."
                        value={confirmacaoSenha}
                        onChange={(e) => setConfirmacaoSenha(e.target.value)}
                        className="w-full h-12 px-4 pr-12 rounded-xl border border-tertiary/20 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all outline-none text-primary"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-tertiary hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                   </div>
                   <p className="text-xs text-tertiary/60 ml-1">
                       Essa ação requer permissão elevada e confirmação de identidade.
                   </p>
                </div>

                <div className="flex gap-3 pt-2">
                   <Button 
                     variant="outline" 
                     className="flex-1 h-12 rounded-xl border-tertiary/20 hover:bg-gray-50"
                     onClick={() => setIsDeleteModalOpen(false)}
                     disabled={isDeleting}
                   >
                     Cancelar
                   </Button>
                   <Button 
                     className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 font-semibold"
                     onClick={handleConfirmDelete}
                     disabled={isDeleting || !confirmacaoSenha}
                   >
                     {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Exclusão"}
                   </Button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}