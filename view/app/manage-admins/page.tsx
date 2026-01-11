"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  User,
  ShieldCheck,
  Shield,
  Loader2,
  AlertCircle,
  Hash,
  Trash2,
  Key,
  ChevronRight,
  Fingerprint,
  AlertTriangle,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface IAdmin {
  id: number;
  nome: string;
  cpf: string;
  tipo_usuario: string;
}

export default function ManageAdminsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth(); // Pegamos o user para evitar auto-delete
  
  const [idBusca, setIdBusca] = useState("");
  const [adminEncontrado, setAdminEncontrado] = useState<IAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");

  // --- ESTADOS DO MODAL DE EXCLUSÃO ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Função para formatar o CPF visualmente
  const formatarCpfDisplay = (cpf: string) => {
    const apenasNumeros = cpf.replace(/\D/g, "");
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idBusca) return;

    setIsLoading(true);
    setErro("");
    setAdminEncontrado(null);

    try {
      const data = await adminService.getAdminById(idBusca);
      setAdminEncontrado(data);
    } catch (error: any) {
      console.error("Erro ao buscar admin:", error);
      if (error.response?.status === 404) {
        setErro(`Administrador com ID ${idBusca} não encontrado.`);
      } else {
        setErro("Erro ao buscar administrador. Verifique o ID.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE ABRIR O MODAL ---
  const handleOpenDeleteModal = () => {
    if (!adminEncontrado) return;
    
    // Evita que o admin se delete (opcional, mas recomendado)
    if (user?.id === adminEncontrado.id) {
        toast.warning("Você não pode excluir sua própria conta por aqui.");
        return;
    }

    setConfirmacaoSenha("");
    setIsDeleteModalOpen(true);
  };

  // --- LÓGICA DE CONFIRMAR EXCLUSÃO ---
  const handleConfirmDelete = async () => {
    if (!adminEncontrado) return;

    // Validação Visual da Senha (UX Guardrail)
    if (!confirmacaoSenha) {
      toast.warning("Digite sua senha para confirmar a operação.");
      return;
    }

    setIsDeleting(true);

    try {
      await adminService.deleteAdmin(adminEncontrado.id);
      
      toast.success(`Administrador ${adminEncontrado.nome} removido com sucesso.`);
      
      // Limpa a tela após excluir
      setAdminEncontrado(null);
      setIdBusca("");
      setIsDeleteModalOpen(false);

    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao remover administrador. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-tertiary">
        <Shield className="w-20 h-20 mb-6 text-red-200" />
        <h2 className="text-2xl font-bold text-primary">Acesso Restrito</h2>
        <p className="text-tertiary/80 mt-2">Você precisa ser administrador para acessar esta área.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* --- CABEÇALHO DARK --- */}
      <div className="bg-primary pt-12 pb-24 px-6 md:px-12 shadow-lg">
        <div className="max-w-5xl mx-auto text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium backdrop-blur-sm border border-white/10">
                <ShieldCheck className="w-3 h-3" />
                <span>Super Admin Zone</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Gerenciar Admins
              </h1>
              <p className="text-white/60 max-w-lg">
                Busque administradores pelo ID para gerenciar credenciais e permissões de acesso ao sistema.
              </p>
            </div>

            <div className="w-full md:w-[450px]">
              <form onSubmit={handleBuscar} className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-tertiary group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="number"
                  value={idBusca}
                  onChange={(e) => setIdBusca(e.target.value)}
                  placeholder="Digite o ID do Admin (ex: 11)..."
                  className="w-full h-14 pl-12 pr-32 rounded-2xl bg-white border-0 shadow-xl shadow-black/5 text-primary placeholder:text-tertiary/50 focus:ring-2 focus:ring-secondary/50 transition-all text-base appearance-none"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-2 bottom-2 rounded-xl bg-primary hover:bg-secondary text-white px-6 font-medium transition-all"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="flex-1 px-6 -mt-12 mb-20">
        <div className="max-w-4xl mx-auto">
          
          {erro && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{erro}</span>
            </div>
          )}

          {!adminEncontrado && !isLoading && !erro && (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 text-center border border-dashed border-tertiary/20 shadow-sm">
              <div className="w-20 h-20 bg-quaternary/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10 text-tertiary/40" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Painel Administrativo</h3>
              <p className="text-tertiary max-w-sm mx-auto">
                Digite o número identificador (ID) do administrador acima para visualizar seus detalhes.
              </p>
            </div>
          )}

          {adminEncontrado && (
            <div className="bg-white rounded-3xl shadow-xl shadow-tertiary/10 overflow-hidden border border-tertiary/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-gradient-to-r from-slate-100 to-white p-8 border-b border-tertiary/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-20 h-20 bg-primary text-white rounded-2xl flex items-center justify-center shadow-md shadow-primary/20">
                        <ShieldCheck className="w-10 h-10" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-secondary text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm uppercase tracking-wider">
                        ADMIN
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-primary">
                        {adminEncontrado.nome}
                      </h2>
                      <div className="flex items-center gap-2 mt-2 text-sm text-tertiary">
                          <span className="bg-primary/5 text-primary/80 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border border-primary/10">
                           System Admin
                          </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-sm font-bold text-tertiary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" /> Credenciais
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ID */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3 mb-1">
                        <Fingerprint className="w-4 h-4 text-tertiary" />
                        <span className="text-xs font-semibold text-tertiary uppercase">ID Sistema</span>
                      </div>
                      <p className="text-primary font-mono font-medium text-lg ml-7">#{adminEncontrado.id}</p>
                    </div>

                    {/* CPF FORMATADO AQUI */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3 mb-1">
                        <Hash className="w-4 h-4 text-tertiary" />
                        <span className="text-xs font-semibold text-tertiary uppercase">CPF</span>
                      </div>
                      <p className="text-primary font-medium text-lg ml-7">
                        {formatarCpfDisplay(adminEncontrado.cpf)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3 text-amber-800 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>
                      <strong>Atenção:</strong> Alterações em contas de administradores afetam o acesso ao painel de controle. Verifique a identidade antes de prosseguir.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-tertiary uppercase tracking-widest mb-4">
                    Controle de Acesso
                  </h3>
                  
                  <Button
                    onClick={() => {
                      router.push(
                        `/manage-admins/change-password?id=${adminEncontrado.id}&nome=${encodeURIComponent(adminEncontrado.nome)}`
                      );
                    }}
                    className="w-full h-auto py-4 justify-between bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 group transition-all"
                  >
                    <span className="flex items-center gap-3">
                      <span className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                        <Key className="w-5 h-5" />
                      </span>
                      <span className="font-semibold text-left">
                        Alterar Senha
                        <span className="block text-[10px] font-normal opacity-80">Redefinir acesso</span>
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
                        Remover Admin
                        <span className="block text-[10px] font-normal opacity-70">Desativar conta</span>
                      </span>
                  </Button>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      {isDeleteModalOpen && adminEncontrado && (
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
                <h2 className="text-xl font-bold text-red-900">Remover Administrador?</h2>
                <p className="text-red-700/80 text-sm mt-2">
                  Você está prestes a excluir a conta de <strong>{adminEncontrado.nome}</strong> (ID: {adminEncontrado.id}). Essa ação é irreversível.
                </p>
             </div>

             {/* Corpo do Modal */}
             <div className="p-6 space-y-5">
                <div className="space-y-2">
                   <label className="text-sm font-semibold text-tertiary ml-1 flex items-center gap-2">
                      <Key className="w-3 h-3" /> Confirme com sua senha
                   </label>
                   <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha atual de admin..."
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
                       Essa verificação garante que é você mesmo quem está realizando essa ação crítica.
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
                     {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar e Excluir"}
                   </Button>
                </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}