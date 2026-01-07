"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Shield, Loader2, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";

export default function ChangePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin } = useAuth();

  // Pega os dados passados pela URL
  const targetIdStr = searchParams.get("id");
  const targetNome = searchParams.get("nome");
  const targetId = targetIdStr ? parseInt(targetIdStr) : null;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Proteção básica: se não tiver ID ou não for admin, volta.
  useEffect(() => {
    if (!isAdmin) return;
    if (!targetId || !targetNome) {
        alert("Usuário não selecionado.");
        router.push("/manage-users");
    }
  }, [isAdmin, targetId, targetNome, router]);


  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (newPassword.length < 6) {
        setErro("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    if (newPassword !== confirmPassword) {
        setErro("As senhas não coincidem.");
        return;
    }

    if (!targetId) return;

    setIsLoading(true);

    try {
      // Chama o serviço que criamos no Passo 1
      await userService.changeUserPasswordByAdmin(targetId, newPassword);
      
      // Sucesso! Exibe mensagem e redireciona.
      // (Idealmente usaríamos um componente de Toast/Snackbar aqui, mas o alert funciona)
      alert(`Sucesso!\nA senha para "${targetNome}" foi redefinida.`);
      router.push("/manage-users");

    } catch (error: any) {
      console.error("Erro ao mudar senha:", error);
      setErro("Erro ao tentar alterar a senha no servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-tertiary bg-gray-50/30">
        <Shield className="w-16 h-16 mb-4 text-red-400" />
        <h2 className="text-xl font-bold text-primary">Acesso Restrito</h2>
      </div>
    );
  }

  if (!targetId || !targetNome) return null; // Evita piscar a tela antes do useEffect redirecionar

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-50/30 pb-10 font-poppins">
      
      {/* --- HEADER --- */}
      <div className="w-full bg-quaternary shadow-sm shadow-tertiary/20 py-6 px-6 md:px-12 mb-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-tertiary hover:text-primary hover:bg-quinquenary rounded-full p-2"
          >
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Key className="w-6 h-6" /> Redefinir Senha
            </h1>
            <p className="text-tertiary text-sm mt-1">
               Alterando senha para: <span className="font-semibold text-primary">{targetNome}</span> (ID: {targetId})
            </p>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO DO FORMULÁRIO --- */}
      <div className="max-w-md w-full px-6">
        <div className="bg-white p-8 rounded-xl shadow-md shadow-tertiary/10 border border-tertiary/10">
            
            {erro && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-3 shadow-sm mb-6 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{erro}</span>
                </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-6">
                
                <div className="space-y-2">
                    <Label htmlFor="newPass" className="text-primary font-medium">Nova Senha</Label>
                    <div className="relative">
                        <Key className="absolute left-3 top-3 h-5 w-5 text-tertiary/50" />
                        <Input
                            id="newPass"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-10 border-tertiary/30 focus-visible:ring-primary bg-quinquenary/30"
                            placeholder="Mínimo 6 caracteres"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPass" className="text-primary font-medium">Confirmar Nova Senha</Label>
                    <div className="relative">
                        <Key className="absolute left-3 top-3 h-5 w-5 text-tertiary/50" />
                        <Input
                            id="confirmPass"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 border-tertiary/30 focus-visible:ring-primary bg-quinquenary/30"
                            placeholder="Digite novamente"
                            required
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold h-11 rounded-lg transition-all shadow-sm mt-4"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Confirmar Alteração
                        </>
                    )}
                </Button>

            </form>
        </div>
      </div>
    </div>
  );
}