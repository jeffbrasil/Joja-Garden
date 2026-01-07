"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Leaf, Lock, User } from "lucide-react";
import { authService } from "@/services/authService";
// IMPORTANTE: Importamos a instância do Axios para configurar o header manualmente
import api from "@/services/api";

export default function LoginPage() {
  const router = useRouter();

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Máscara de CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    setCpf(value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const data = await authService.login(cpf, password);
    
    try {
      const payload = JSON.parse(atob(data.access_token.split('.')[1]));
      console.log("QUEM SOU EU NO TOKEN?", payload);
    } catch (e) {
      console.log("Token não é JWT ou erro ao ler", e);
    }
    
    try {
      // 1. Faz a requisição ao backend
      const data = await authService.login(cpf, password);

      // 2. Salva no LocalStorage (persistência)
      authService.setToken(data.access_token);

      // 3. [CORREÇÃO CRÍTICA] Atualiza a instância do Axios IMEDIATAMENTE.
      // Isso evita que a Home carregue antes do interceptor ler o LocalStorage.
      api.defaults.headers.common["Authorization"] =
        `Bearer ${data.access_token}`;

      console.log("Login realizado com sucesso. Redirecionando...");

      // 4. Redireciona para a Home
      router.push("/");
    } catch (err: any) {
      console.error("Erro no login:", err);
      // Tenta pegar a mensagem específica do backend se existir
      const errorMsg =
        err.response?.data?.detail ||
        "Não foi possível entrar. Verifique seu CPF e senha.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F4F9F5] px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl shadow-[#253528]/10 border border-[#8BA889]/20">
        {/* Logo / Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9]">
            <Leaf className="h-8 w-8 text-[#49654E]" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#253528]">
            Joja Garden
          </h2>
          <p className="mt-2 text-sm text-[#8BA889]">
            Acesse para gerenciar seu jardim
          </p>
        </div>

        {/* Formulário */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-[#253528] font-medium">
                CPF
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-[#8BA889]" />
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  className="pl-10 border-[#8BA889]/30 focus:border-[#49654E] focus:ring-[#49654E] bg-[#F9FBF9]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-[#253528] font-medium"
                >
                  Senha
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[#8BA889]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-[#8BA889]/30 focus:border-[#49654E] focus:ring-[#49654E] bg-[#F9FBF9]"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg text-center border border-red-100">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#49654E] hover:bg-[#253528] text-white h-11 rounded-lg transition-colors font-semibold text-md shadow-md"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <div className="text-center text-sm text-[#8BA889]">
            Ainda não tem cadastro? Procure um administrador.
          </div>
        </form>
      </div>
    </div>
  );
}
