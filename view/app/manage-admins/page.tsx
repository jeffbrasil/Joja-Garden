"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/modals/alert-modal"; // Importando o componente correto
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Trash2,
  Key,
  ChevronRight,
  Fingerprint,
  UserCog,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";

interface IAdmin {
  id: number;
  nome: string;
  cpf: string;
  tipo_usuario: string;
}

export default function ManageAdminsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  
  const [idBusca, setIdBusca] = useState("");
  const [adminEncontrado, setAdminEncontrado] = useState<IAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");

  // --- ESTADOS DO MODAL ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Formatar CPF (Visual)
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
        setErro(`Nenhum administrador encontrado com o ID #${idBusca}.`);
      } else {
        setErro("Erro ao buscar dados. Verifique sua conexão.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDeleteModal = () => {
    if (!adminEncontrado) return;
    
    if (user?.id === adminEncontrado.id) {
       toast.warning("Ação bloqueada", {
         description: "Você não pode excluir sua própria conta por este painel."
       });
       return;
    }

    setConfirmacaoSenha("");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!adminEncontrado) return;

    if (!confirmacaoSenha) {
      toast.error("Senha necessária", { description: "Digite sua senha para confirmar a exclusão." });
      return;
    }

    setIsDeleting(true);

    try {
      await adminService.deleteAdmin(adminEncontrado.id);
      
      toast.success("Administrador removido", {
        description: `A conta de ${adminEncontrado.nome} foi excluída com sucesso.`
      });
      
      setAdminEncontrado(null);
      setIdBusca("");
      setIsDeleteModalOpen(false);

    } catch (error: any) {
      console.error(error);
      toast.error("Falha na exclusão", {
        description: "Verifique sua senha ou tente novamente mais tarde."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#8BA889]">
        <ShieldAlert className="w-20 h-20 mb-6 text-red-300" />
        <h2 className="text-2xl font-bold text-[#253528]">Acesso Restrito</h2>
        <p className="mt-2">Esta área é exclusiva para administradores.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAF9] font-poppins relative overflow-x-hidden">
      
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#E8F5E9] to-[#F8FAF9] -z-10" />

      {/* --- CABEÇALHO --- */}
      <div className="pt-12 pb-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#253528] text-white text-xs font-bold tracking-wide shadow-lg shadow-[#253528]/20">
                <ShieldCheck className="w-3 h-3" />
                <span>ADMIN ZONE</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#253528] tracking-tight">
                Gerenciar Admins
              </h1>
              <p className="text-[#8BA889] max-w-lg font-medium">
                Controle de acesso e credenciais da equipe administrativa.
              </p>
            </div>

            {/* BUSCA */}
            <div className="w-full md:w-[400px]">
              <form onSubmit={handleBuscar} className="relative group z-20">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className={`h-5 w-5 transition-colors ${isLoading ? 'text-[#49654E]' : 'text-[#8BA889] group-focus-within:text-[#49654E]'}`} />
                </div>
                <input
                  type="number"
                  value={idBusca}
                  onChange={(e) => setIdBusca(e.target.value)}
                  placeholder="Buscar por ID (ex: 10)..."
                  className="w-full h-14 pl-12 pr-32 rounded-2xl bg-white border border-[#8BA889]/20 shadow-xl shadow-[#253528]/5 text-[#253528] placeholder:text-[#8BA889]/60 focus:ring-2 focus:ring-[#49654E]/20 focus:border-[#49654E] transition-all text-base appearance-none outline-none"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !idBusca}
                  className="absolute right-2 top-2 bottom-2 rounded-xl bg-[#49654E] hover:bg-[#3d5441] text-white px-6 font-bold transition-all disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="flex-1 px-6 -mt-8 mb-20">
        <div className="max-w-4xl mx-auto">
          
          {erro && (
            <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-800">Não foi possível encontrar</h3>
                <p className="text-sm text-red-600/80">{erro}</p>
              </div>
            </div>
          )}

          {!adminEncontrado && !isLoading && !erro && (
            <div className="bg-white/60 backdrop-blur-sm rounded-[2rem] p-12 text-center border border-dashed border-[#8BA889]/30">
              <div className="w-20 h-20 bg-[#F4F9F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCog className="w-10 h-10 text-[#8BA889]/50" />
              </div>
              <h3 className="text-lg font-bold text-[#253528] mb-1">Aguardando Busca</h3>
              <p className="text-[#8BA889] text-sm">Digite o ID acima para carregar o perfil.</p>
            </div>
          )}

          {adminEncontrado && (
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#253528]/10 overflow-hidden border border-[#8BA889]/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-[#F4F9F5] p-8 md:p-10 border-b border-[#8BA889]/10 relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Shield className="w-32 h-32 text-[#49654E]" />
                 </div>
                 
                 <div className="flex items-center gap-6 relative z-10">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-lg shadow-[#49654E]/10 flex items-center justify-center text-[#49654E] border border-[#8BA889]/20">
                       <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div>
                       <div className="flex items-center gap-2 mb-2">
                          <span className="bg-[#49654E] text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                             ID #{adminEncontrado.id}
                          </span>
                       </div>
                       <h2 className="text-3xl font-bold text-[#253528]">{adminEncontrado.nome}</h2>
                       <p className="text-[#8BA889] font-medium flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          Administrador Ativo
                       </p>
                    </div>
                 </div>
              </div>

              <div className="p-8 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-[#8BA889] uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Fingerprint className="w-4 h-4" /> Dados Pessoais
                  </h3>
                  
                  <div className="bg-[#F8FAF9] p-5 rounded-2xl border border-[#8BA889]/20 hover:border-[#49654E]/30 transition-colors group">
                    <label className="text-xs font-bold text-[#253528]/60 uppercase block mb-1">CPF</label>
                    <p className="text-xl font-mono text-[#253528] font-semibold tracking-wide group-hover:text-[#49654E] transition-colors">
                      {formatarCpfDisplay(adminEncontrado.cpf)}
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4 text-amber-800 text-sm leading-relaxed">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-1" />
                    <p>
                      <strong>Zona de Perigo:</strong> Alterações aqui impactam diretamente o acesso ao sistema. Verifique a identidade do solicitante.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-xs font-bold text-[#8BA889] uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Key className="w-4 h-4" /> Ações de Segurança
                  </h3>

                  <Button
                    onClick={() => router.push(`/manage-admins/change-password?id=${adminEncontrado.id}&nome=${encodeURIComponent(adminEncontrado.nome)}`)}
                    className="w-full h-auto py-5 justify-between bg-[#253528] hover:bg-[#1a261d] text-white rounded-2xl shadow-xl shadow-[#253528]/20 group transition-all"
                  >
                    <span className="flex items-center gap-4 pl-2">
                      <div className="bg-white/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                        <Key className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                         <span className="block font-bold">Redefinir Senha</span>
                         <span className="text-xs text-white/60 font-normal">Gerar nova credencial</span>
                      </div>
                    </span>
                    <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform pr-2" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleOpenDeleteModal}
                    className="w-full h-auto py-5 justify-start border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-2xl group transition-all"
                  >
                    <div className="bg-red-100 p-2 rounded-xl mr-4 group-hover:bg-red-200 transition-colors ml-2">
                       <Trash2 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                       <span className="block font-bold">Remover Acesso</span>
                       <span className="text-xs text-red-400 font-normal">Excluir conta permanentemente</span>
                    </div>
                  </Button>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- ALERT MODAL (Reutilizável) --- */}
      {adminEncontrado && (
        <AlertModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          loading={isDeleting}
          title="Remover Administrador?"
          description={`Você tem certeza que deseja remover ${adminEncontrado.nome} (ID: ${adminEncontrado.id})? Essa ação não pode ser desfeita.`}
        >
          {/* Conteúdo Injetado no Modal (Input de Senha) */}
          <div className="mt-4 pt-4 border-t border-gray-100 w-full space-y-3 text-left">
             <label className="text-xs font-bold text-[#253528]/70 uppercase ml-1">Confirme com sua senha</label>
             <div className="relative group">
                <Key className="absolute left-4 top-3.5 h-5 w-5 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha de admin..."
                  value={confirmacaoSenha}
                  onChange={(e) => setConfirmacaoSenha(e.target.value)}
                  className="w-full h-12 pl-12 pr-12 rounded-xl border border-[#8BA889]/30 bg-[#F9FBF9] focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all outline-none text-[#253528]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[#8BA889] hover:text-[#49654E] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
             </div>
             <p className="text-[10px] text-red-400 ml-1">
                * Obrigatório para operações críticas
             </p>
          </div>
        </AlertModal>
      )}

    </div>
  );
}