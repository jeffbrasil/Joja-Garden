"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  Key,
  Save,
  ArrowLeft,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

function ChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idParam = searchParams.get("id");
  const nomeParam = searchParams.get("nome") || "Administrador";

  const [isLoading, setIsLoading] = useState(false);
  // Estados de visibilidade individuais
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idParam) {
      toast.error("Erro de Identificação", {
        description: "ID do administrador não encontrado.",
      });
      return;
    }

    const adminId = Number(idParam);
    if (isNaN(adminId)) {
      toast.error("ID Inválido", {
        description: "O ID do usuário não é um número válido.",
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error("Validação Falhou", {
        description: "As novas senhas não coincidem.",
      });
      return;
    }

    if (novaSenha.length < 6) {
      toast.warning("Senha Fraca", {
        description: "A nova senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await adminService.updateAdminPassword(idParam, {
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
      });

      toast.success("Senha Atualizada!", {
        description: `Credenciais de ${nomeParam} alteradas com sucesso.`,
        icon: <CheckCircle2 className="text-green-500" />,
      });

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 400 || error.response?.status === 401) {
        toast.error("Não autorizado", {
          description: "A senha atual digitada está incorreta.",
        });
      } else {
        toast.error("Erro no Sistema", {
          description: "Tente novamente mais tarde.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAF9] font-poppins">
      {/* Background Decorativo */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#49654E]/5 rounded-full blur-3xl pointer-events-none" />

      {/* --- CABEÇALHO COMPACTO --- */}
      <div className="bg-white border-b border-[#8BA889]/10 py-6 px-6 sticky top-0 z-20 backdrop-blur-md bg-white/80">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-[#8BA889] hover:text-[#253528] hover:bg-[#F4F9F5] -ml-2 gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="flex items-center gap-2 text-[#253528] font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#49654E]" />
            Gerenciar Admins
          </div>
        </div>
      </div>

      {/* --- CARD FLUTUANTE --- */}
      <div className="flex-1 px-4 py-10 flex items-center justify-center relative z-10">
        <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-[#253528]/10 border border-[#8BA889]/20 overflow-hidden">
          <div className="p-8 md:p-10 pb-6 text-center">
            <div className="w-16 h-16 bg-[#F4F9F5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#49654E]">
              <Key className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-[#253528]">Alterar Senha</h1>
            <p className="text-[#8BA889] mt-2 text-sm">
              Você está alterando as credenciais de:
              <br />
              <span className="text-[#49654E] font-bold text-base">
                {nomeParam}
              </span>{" "}
              <span className="text-xs opacity-70">(ID: {idParam})</span>
            </p>
          </div>

          <div className="px-8 md:px-10 pb-10">
            {/* Aviso */}
            <div className="mb-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Por segurança, é necessário informar a{" "}
                <strong>senha atual</strong> deste administrador para validar a
                troca.
              </p>
            </div>

            <form onSubmit={handleSalvar} className="space-y-5">
              {/* Senha Atual */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#253528]/70 uppercase ml-1">
                  Senha Atual
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="Digite a senha atual"
                    required
                    className="pl-12 pr-10 h-12 rounded-xl border-[#8BA889]/20 bg-[#F9FBF9] focus:border-[#49654E] focus:ring-[#49654E]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-3.5 text-[#8BA889] hover:text-[#49654E]"
                  >
                    {showCurrent ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="h-px bg-[#8BA889]/10 my-2" />

              {/* Nova Senha */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#253528]/70 uppercase ml-1">
                  Nova Senha
                </Label>
                <div className="relative group">
                  <Key className="absolute left-4 top-3.5 h-5 w-5 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
                  <Input
                    type={showNew ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="No mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="pl-12 pr-10 h-12 rounded-xl border-[#8BA889]/20 bg-[#F9FBF9] focus:border-[#49654E] focus:ring-[#49654E]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-3.5 text-[#8BA889] hover:text-[#49654E]"
                  >
                    {showNew ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#253528]/70 uppercase ml-1">
                  Confirmar Nova Senha
                </Label>
                <div className="relative group">
                  <Key className="absolute left-4 top-3.5 h-5 w-5 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    className={`pl-12 pr-10 h-12 rounded-xl border bg-[#F9FBF9] transition-all
                      ${
                        confirmarSenha && novaSenha !== confirmarSenha
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-[#8BA889]/20 focus:border-[#49654E] focus:ring-[#49654E]/20"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3.5 text-[#8BA889] hover:text-[#49654E]"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {confirmarSenha && novaSenha !== confirmarSenha && (
                  <p className="text-xs text-red-500 font-medium ml-1 animate-in slide-in-from-top-1">
                    As senhas não coincidem.
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-[#49654E] hover:bg-[#3d5441] text-white text-lg font-bold rounded-xl shadow-lg shadow-[#49654E]/20 transition-all flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChangeAdminPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#F8FAF9]">
          <Loader2 className="w-10 h-10 animate-spin text-[#49654E]" />
        </div>
      }
    >
      <ChangePasswordContent />
    </Suspense>
  );
}
