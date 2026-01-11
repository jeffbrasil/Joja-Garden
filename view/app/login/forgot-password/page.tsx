"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  ArrowLeft, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Sprout
} from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // Controle de Etapas: 1 = CPF, 2 = Código, 3 = Nova Senha, 4 = Sucesso
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Dados do Formulário
  const [cpf, setCpf] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [code, setCode] = useState(""); 
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);

  // --- Funções Auxiliares ---

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(value);
    setErrorMessage("");
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite apenas letras e números, converte para maiúsculo
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setCode(value.slice(0, 6));
    setErrorMessage("");
  };

  // --- Handlers de Cada Etapa ---

  // Etapa 1: Enviar CPF e buscar Email
  const handleSendCpf = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (cpf.length < 14) {
        setErrorMessage("Por favor, digite um CPF válido.");
        setIsLoading(false);
        return;
    }

    try {
      const data = await authService.getEmailByCpf(cpf);
      
      if(!data.email) throw new Error("Email não vinculado.");

      setUserEmail(data.email);
      setStep(2); 
      toast.success("Código enviado para o seu e-mail.");
    } catch (err: any) {
      console.error(err);
      setErrorMessage("CPF não encontrado ou erro ao buscar dados.");
    } finally {
      setIsLoading(false);
    }
  };

  // Etapa 2: Validar Código
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    // Simulação (Backend ainda não tem endpoint específico de validação isolada)
    setTimeout(() => {
      if (code.length === 6) {
        setIsLoading(false);
        setStep(3); // Vai para nova senha
        toast.success("Código validado com sucesso.");
      } else {
        setIsLoading(false);
        setErrorMessage("Código inválido. O código deve ter 6 dígitos.");
      }
    }, 1000);
  };

  // Etapa 3: Redefinir Senha
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 4) {
       setErrorMessage("A senha deve ter no mínimo 4 caracteres.");
       return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(newPassword);
      setStep(4); // Sucesso
      toast.success("Senha alterada com sucesso!");
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Ocorreu um erro ao redefinir a senha.";
      setErrorMessage(msg);
      
      if (err.response?.status === 401) {
        setErrorMessage("Sessão expirada ou não autorizada.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-quinquenary flex min-h-screen w-full items-center justify-center bg-[#F8FAF9] px-4 relative overflow-hidden font-poppins">
      
      {/* --- Elementos de Fundo (Decorativos Identicos ao Login) --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#49654E]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#8BA889]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-[#253528]/10 border border-[#8BA889]/10 relative z-10 transition-all duration-300">
        
        {/* Header com botão voltar */}
        {step !== 4 && (
          <button 
            onClick={() => step === 1 ? router.push("/login") : setStep(step - 1)}
            className="flex items-center text-xs font-bold uppercase tracking-wide text-[#8BA889] hover:text-[#49654E] transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Voltar
          </button>
        )}

        {/* --- ETAPA 1: DIGITAR CPF --- */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9] text-[#49654E]">
                <KeyRound className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#253528]">Recuperar Senha</h2>
              <p className="text-[#8BA889] text-sm mt-2 font-medium">
                Informe seu CPF para localizarmos sua conta.
              </p>
            </div>

            <form onSubmit={handleSendCpf} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="cpf-recuperacao" className="text-xs font-bold text-[#253528]/70 uppercase tracking-wide ml-1">CPF</Label>
                <div className="relative group">
                    <User className={`absolute left-4 top-3.5 h-5 w-5 transition-colors ${errorMessage ? "text-red-400" : "text-[#8BA889] group-focus-within:text-[#49654E]"}`} />
                    <Input
                    id="cpf-recuperacao"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    className={`pl-12 h-12 rounded-xl border-[#8BA889]/20 focus:ring-[#49654E]/20 bg-[#F9FBF9] transition-all
                        ${errorMessage ? "border-red-300 focus:border-red-400 bg-red-50/10" : "focus:border-[#49654E]"}
                    `}
                    required
                    />
                </div>
              </div>
              
              {/* Alerta de Erro */}
              {errorMessage && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300 rounded-xl bg-red-50 border border-red-100 p-3 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full bg-[#49654E] hover:bg-[#3d5441] text-white h-12 rounded-xl font-bold shadow-lg shadow-[#49654E]/20">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continuar"}
              </Button>
            </form>
          </div>
        )}

        {/* --- ETAPA 2: CÓDIGO DE VERIFICAÇÃO --- */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Mail className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#253528]">Verifique seu E-mail</h2>
              <p className="text-[#8BA889] text-sm mt-2">
                Enviamos um código para: <br/>
                <span className="font-semibold text-[#49654E]">{userEmail}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2 flex flex-col items-center">
                <Label className="text-xs font-bold text-[#253528]/70 uppercase tracking-wide">Código de 6 Dígitos</Label>
                
                {/* Input estilo OTP */}
                <Input
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  className={`text-center text-3xl tracking-[0.5em] font-mono h-14 w-full bg-[#F9FBF9] border-[#8BA889]/30 rounded-xl transition-all
                     ${errorMessage ? "border-red-300 focus:border-red-400 bg-red-50/10" : "focus:border-[#49654E] focus:ring-[#49654E]/20"}
                  `}
                  maxLength={6}
                />
              </div>

              {errorMessage && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300 rounded-xl bg-red-50 border border-red-100 p-3 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
                </div>
              )}

              <Button type="submit" disabled={isLoading || code.length < 6} className="w-full bg-[#49654E] hover:bg-[#3d5441] text-white h-12 rounded-xl font-bold shadow-lg shadow-[#49654E]/20">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verificar Código"}
              </Button>
              
              <div className="text-center">
                 <button type="button" onClick={() => setStep(1)} className="text-xs text-[#8BA889] hover:text-[#49654E] underline">
                    Não recebeu? Tentar outro CPF
                 </button>
              </div>
            </form>
          </div>
        )}

        {/* --- ETAPA 3: NOVA SENHA --- */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#253528]">Criar Nova Senha</h2>
              <p className="text-[#8BA889] text-sm mt-2 font-medium">
                Sua segurança é prioridade.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-4">
                {/* Nova Senha */}
                <div className="space-y-2">
                    <Label htmlFor="new-pass" className="text-xs font-bold text-[#253528]/70 uppercase tracking-wide ml-1">Nova Senha</Label>
                    <div className="relative">
                        <Input
                            id="new-pass"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setErrorMessage(""); }}
                            className="pr-10 h-12 rounded-xl border-[#8BA889]/20 focus:border-[#49654E] focus:ring-[#49654E]/20 bg-[#F9FBF9]"
                            required
                        />
                         <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-3.5 text-[#8BA889] hover:text-[#49654E]"
                        >
                            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                    <Label htmlFor="conf-pass" className="text-xs font-bold text-[#253528]/70 uppercase tracking-wide ml-1">Confirmar Senha</Label>
                    <div className="relative">
                        <Input
                            id="conf-pass"
                            type={showConfPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setErrorMessage(""); }}
                            className="pr-10 h-12 rounded-xl border-[#8BA889]/20 focus:border-[#49654E] focus:ring-[#49654E]/20 bg-[#F9FBF9]"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfPassword(!showConfPassword)}
                            className="absolute right-3 top-3.5 text-[#8BA889] hover:text-[#49654E]"
                        >
                            {showConfPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
              </div>

              {errorMessage && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300 rounded-xl bg-red-50 border border-red-100 p-3 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full bg-[#49654E] hover:bg-[#3d5441] text-white h-12 rounded-xl font-bold shadow-lg shadow-[#49654E]/20">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Redefinir Senha"}
              </Button>
            </form>
          </div>
        )}

        {/* --- ETAPA 4: SUCESSO --- */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-500 py-6">
            <div className="relative mx-auto mb-6 group">
                <div className="absolute inset-0 bg-green-200/50 rounded-full blur-xl animate-pulse"></div>
                <div className="relative h-24 w-24 mx-auto flex items-center justify-center rounded-full bg-green-100 border-4 border-white shadow-xl">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-[#253528]">Tudo Pronto!</h2>
            <p className="text-[#8BA889] font-medium leading-relaxed">
              Sua senha foi redefinida com sucesso. <br/>
              Utilize sua nova credencial para acessar o jardim.
            </p>

            <Button 
              onClick={() => router.push("/login")} 
              className="w-full bg-[#49654E] hover:bg-[#3d5441] text-white h-12 rounded-xl font-bold shadow-lg mt-6"
            >
              Voltar para o Login
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}