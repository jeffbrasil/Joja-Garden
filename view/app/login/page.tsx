"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Leaf,
  Lock,
  User,
  Eye,
  EyeOff,
  Sprout,
  AlertCircle,
} from "lucide-react";
import { authService } from "@/services/authService";
import api from "@/services/api";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Novo estado para controlar a mensagem de erro na tela
  const [errorMessage, setErrorMessage] = useState("");

  // Máscara de CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    setCpf(value);
    // Limpa o erro assim que o usuário começa a digitar novamente
    if (errorMessage) setErrorMessage("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Limpa o erro assim que o usuário começa a digitar novamente
    if (errorMessage) setErrorMessage("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Limpa erro anterior

    if (!cpf || !password) {
      setErrorMessage("Por favor, preencha o CPF e a senha.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.login(cpf, password);

      authService.setToken(data.access_token);
      api.defaults.headers.common["Authorization"] =
        `Bearer ${data.access_token}`;

      toast.success("Bem-vindo de volta!");
      router.push("/");
    } catch (err: any) {
      console.error("Erro no login:", err);

      // Lógica para capturar a mensagem de erro ou definir uma padrão
      let msg = "Não foi possível conectar ao servidor.";

      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          msg = "CPF ou senha incorretos. Verifique suas credenciais.";
        } else if (err.response.data && err.response.data.detail) {
          msg = err.response.data.detail;
        }
      }

      setErrorMessage(msg);
      // Opcional: Ainda mostra um toast discreto caso o usuário não esteja olhando para o form
      // toast.error("Falha na autenticação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-quinquenary px-4 relative overflow-hidden font-poppins">
      {/* --- Elementos de Fundo (Decorativos) --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#49654E]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#8BA889]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-[#253528]/10 border border-[#8BA889]/10 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Header da Card */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-[#49654E]/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-500"></div>
            <div className="relative h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#49654E] to-[#253528] text-white shadow-lg">
              <Sprout className="h-10 w-10" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#253528]">
            Joja Garden
          </h2>
          <p className="mt-2 text-sm font-medium text-[#8BA889] max-w-[80%]">
            Gerencie seu jardim digital
          </p>
        </div>

        {/* Formulário */}
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-5">
            {/* Input CPF */}
            <div className="space-y-2">
              <Label
                htmlFor="cpf"
                className="text-xs font-bold text-[#253528]/70 uppercase tracking-wide ml-1"
              >
                CPF
              </Label>
              <div className="relative group">
                <User
                  className={`absolute left-4 top-3.5 h-5 w-5 transition-colors ${errorMessage ? "text-red-400" : "text-[#8BA889] group-focus-within:text-[#49654E]"}`}
                />
                <Input
                  id="cpf"
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

            {/* Input Senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold text-[#253528]/70 uppercase tracking-wide ml-1"
                >
                  Senha
                </Label>
              </div>
              <div className="relative group">
                <Lock
                  className={`absolute left-4 top-3.5 h-5 w-5 transition-colors ${errorMessage ? "text-red-400" : "text-[#8BA889] group-focus-within:text-[#49654E]"}`}
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`pl-12 pr-12 h-12 rounded-xl border-[#8BA889]/20 focus:ring-[#49654E]/20 bg-[#F9FBF9] transition-all
                    ${errorMessage ? "border-red-300 focus:border-red-400 bg-red-50/10" : "focus:border-[#49654E]"}
                  `}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-[#8BA889] hover:text-[#49654E] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* --- ÁREA DE ALERTA DE ERRO (NOVO) --- */}
          {errorMessage && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300 rounded-xl bg-red-50 border border-red-100 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-red-800">
                  Falha no acesso
                </h4>
                <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className={`w-full h-12 rounded-xl transition-all font-bold tracking-wide text-md shadow-lg mt-2
                ${
                  errorMessage
                    ? "bg-red-600 hover:bg-red-700 shadow-red-200 text-white"
                    : "bg-[#49654E] hover:bg-[#3d5441] shadow-[#49654E]/20 text-white"
                }
            `}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Entrando...
              </>
            ) : errorMessage ? (
              "Tentar Novamente"
            ) : (
              "Acessar Sistema"
            )}
          </Button>

          <div className="pt-4 text-center border-t border-[#8BA889]/10 mt-6">
            <span className="text-xs text-[#8BA889] flex items-center justify-center gap-2">
              <Leaf className="w-3 h-3" /> Joja Garden v1.0
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
