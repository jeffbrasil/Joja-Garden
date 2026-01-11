"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Shield,
  Mail,
  Lock,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Fingerprint,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/services/adminService";
import { userService } from "@/services/userService";
import { useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";

interface IProfileData {
  id: number;
  nome: string;
  cpf?: string;
  email?: string;
  tipo_usuario: string;
}

export default function AccountDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // --- STATES ---
  const [profileData, setProfileData] = useState<IProfileData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Formulário
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Modais
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Amarelo
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Verde

  // --- EFEITO DE CARREGAMENTO ---
  useEffect(() => {
    const fetchFullData = async () => {
      if (!user) return;
      try {
        setIsLoadingData(true);
        let data;
        if (user.tipo_usuario === "admin") {
          data = await adminService.getAdminById(user.id);
        } else {
          data = user;
        }
        setProfileData(data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Não foi possível carregar detalhes.");
        setProfileData(user as unknown as IProfileData);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchFullData();
  }, [user]);

  const formatarCpf = (cpf: string | undefined | null) => {
    if (!cpf) return "Não informado";
    return String(cpf)
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const isAdmin = user?.tipo_usuario === "admin";

  // 1. PRÉ-VALIDAÇÃO (Botão Salvar)
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
        toast.warning("Preencha todos os campos.");
        return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.warning("As novas senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      toast.warning("Mínimo de 6 caracteres.");
      return;
    }

    // Abre Modal Amarelo
    setIsConfirmModalOpen(true);
  };

  // 2. EXECUÇÃO REAL (Confirmação do Modal Amarelo)
  const executeUpdatePassword = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const dadosEnvio = { senha_atual: senhaAtual, nova_senha: novaSenha };

      if (isAdmin) {
        await adminService.updateAdminPassword(user.id, dadosEnvio);
      } else {
        await userService.updatePassword(dadosEnvio);
      }

      // Limpa formulário
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");

      // FECHA O AMARELO E ABRE O VERDE
      setIsConfirmModalOpen(false); 
      setIsSuccessModalOpen(true); 

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || "Erro ao atualizar senha.";
      toast.error(msg);
      setIsConfirmModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quinquenary">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-quinquenary pt-24 pb-12 px-6 md:px-12 font-poppins transition-all">
      <div className="max-w-6xl mx-auto w-full py-12">
        {/* Header e Coluna de Dados Pessoais (código mantido igual) */}
        <div className="bg-white rounded-3xl p-8 shadow-sm shadow-tertiary/10 border border-tertiary/5 flex flex-col md:flex-row items-center gap-8 mb-8 relative overflow-hidden">
             {/* ... (conteúdo do header igual ao anterior) ... */}
             <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
             <div className="relative z-10">
                <div className="w-28 h-28 bg-quaternary rounded-full flex items-center justify-center text-primary border-4 border-white shadow-lg shadow-tertiary/10">
                  <User className="w-12 h-12" />
                </div>
             </div>
             <div className="text-center md:text-left space-y-2 flex-1 z-10">
                <h1 className="text-3xl font-bold text-primary tracking-tight">{profileData.nome}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${isAdmin ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary/10 text-secondary border-secondary/20"}`}>
                    {profileData.tipo_usuario}
                  </span>
                  <span className="text-sm text-tertiary font-medium">ID: #{profileData.id}</span>
                </div>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna 1: Dados (Mantido igual) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm shadow-tertiary/10 border border-tertiary/5 h-full relative overflow-hidden">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5" /> Meus Dados
                </h2>
                <div className="space-y-6">
                    {/* Exibe CPF ou Email dependendo do tipo (igual anterior) */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-2 text-tertiary">
                            {isAdmin ? <Fingerprint className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                            <span className="text-xs font-bold uppercase tracking-wide">{isAdmin ? "CPF" : "E-mail"} (Login)</span>
                        </div>
                        <div className="text-gray-700 font-medium bg-quaternary/30 px-4 py-3 rounded-xl border border-tertiary/10 truncate">
                            {isAdmin ? formatarCpf(profileData.cpf) : profileData.email}
                        </div>
                    </div>
                     <div className="group">
                        <div className="flex items-center gap-2 mb-2 text-tertiary">
                            <Shield className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wide">Nível de Acesso</span>
                        </div>
                        <div className="text-gray-700 font-medium bg-quaternary/30 px-4 py-3 rounded-xl border border-tertiary/10 capitalize flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${isAdmin ? "bg-primary" : "bg-secondary"}`}></div>
                             {profileData.tipo_usuario}
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Coluna 2: Formulário */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm shadow-tertiary/10 border border-tertiary/5 h-full">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Lock className="w-5 h-5" /> Segurança
                </h2>
              </div>
              <p className="text-sm text-tertiary mb-8">
                Atualize sua senha periodicamente para manter seu jardim seguro.
              </p>

              <form onSubmit={handlePreSubmit} className="space-y-6">
                 {/* Inputs de senha (mesmo código anterior) */}
                 <div className="bg-quaternary/40 text-primary text-sm p-4 rounded-2xl border border-primary/5 mb-6 flex gap-3 items-start">
                    <Shield className="w-5 h-5 shrink-0 mt-0.5 text-secondary" />
                    <p className="leading-relaxed">Para sua segurança, exigimos a confirmação da senha atual antes de realizar qualquer alteração.</p>
                 </div>

                 <div className="grid gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-primary/80 ml-1">Senha Atual</label>
                        <Input type={showPassword ? "text" : "password"} value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required placeholder="Sua senha atual" className="h-12 bg-gray-50/50 border-tertiary/20 focus:border-primary focus:ring-primary/10 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-primary/80 ml-1">Nova Senha</label>
                            <Input type={showPassword ? "text" : "password"} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required placeholder="Mínimo 6 caracteres" className="h-12 bg-gray-50/50 border-tertiary/20 focus:border-primary focus:ring-primary/10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-primary/80 ml-1">Confirmar Nova Senha</label>
                            <Input type={showPassword ? "text" : "password"} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required placeholder="Repita a nova senha" className={`h-12 bg-gray-50/50 rounded-xl ${confirmarSenha && novaSenha !== confirmarSenha ? "border-red-300 focus:border-red-500" : "border-tertiary/20 focus:border-primary"}`} />
                        </div>
                    </div>
                 </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-tertiary/5 mt-4">
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-sm text-tertiary hover:text-primary flex items-center gap-2 transition-colors px-2 py-1 font-medium">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPassword ? "Ocultar caracteres" : "Mostrar senhas"}
                  </button>
                  <Button type="submit" disabled={isSaving} className="w-full md:w-auto bg-primary hover:bg-secondary text-white rounded-xl px-8 h-12 shadow-lg shadow-tertiary/20 font-semibold tracking-wide">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* --- MODAL 1: CONFIRMAÇÃO (AMARELO/SEPTENARY) --- */}
        <AlertModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={executeUpdatePassword}
            loading={isSaving}
            title="Confirmar Alteração"
            description="Tem certeza que deseja alterar sua senha? Você precisará fazer login novamente em outros dispositivos."
            variant="warning"
            confirmText="Sim, alterar senha"
            cancelText="Cancelar"
        />

        {/* --- MODAL 2: SUCESSO (VERDE/SUCCESS) --- */}
        <AlertModal
            isOpen={isSuccessModalOpen}
            onClose={() => setIsSuccessModalOpen(false)}
            onConfirm={() => setIsSuccessModalOpen(false)}
            title="Senha Atualizada!"
            description="Suas credenciais de acesso foram alteradas com sucesso. Seu jardim continua seguro!"
            variant="success"
            confirmText="Ótimo, obrigado"
            cancelText="Fechar"
        />

      </div>
    </div>
  );
}