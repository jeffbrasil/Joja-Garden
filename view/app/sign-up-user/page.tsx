"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import {
  Sprout,
  Loader2,
  MapPin,
  Mail,
  User,
  Shield,
  KeyRound,
  ArrowLeft,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/modals/alert-modal";

export default function SignUpUser() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    endereco: "",
    senha: "",
    confirmarSenha: "",
  });

  const [loading, setLoading] = useState(false);
  const [verifyingAuth, setVerifyingAuth] = useState(true);

  // Estado do AlertModal
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

  const closeAlert = () =>
    setAlertState((prev) => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const token = localStorage.getItem("joja_token");
    if (!token) {
      setAlertState({
        isOpen: true,
        title: "Sessão Expirada",
        description: "Você precisa estar logado para cadastrar novos usuários.",
        variant: "warning",
        onConfirm: () => router.push("/login"),
      });
    } else {
      setVerifyingAuth(false);
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Aplica máscara se for CPF
    if (e.target.id === "cpf") {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      setFormData({ ...formData, cpf: value });
    } else {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmarSenha) {
      setAlertState({
        isOpen: true,
        title: "Senhas Divergentes",
        description: "As senhas digitadas não conferem.",
        variant: "warning",
        onConfirm: closeAlert,
      });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("joja_token");

    try {
      const payload = {
        nome: formData.nome,
        cpf: formData.cpf,
        email: formData.email,
        senha: formData.senha,
        endereco: formData.endereco,
      };

      await api.post("/usuario/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAlertState({
        isOpen: true,
        title: "Usuário Cadastrado!",
        description: `O cliente ${formData.nome} já pode acessar o jardim.`,
        variant: "success",
        onConfirm: () => router.push("/manage-users"),
      });
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setAlertState({
          isOpen: true,
          title: "Sem Permissão",
          description: "Sua sessão expirou. Faça login novamente.",
          variant: "danger",
          onConfirm: () => router.push("/login"),
        });
      } else {
        setAlertState({
          isOpen: true,
          title: "Erro no Cadastro",
          description:
            err.response?.data?.detail || "Ocorreu um erro inesperado.",
          variant: "danger",
          onConfirm: closeAlert,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Se estiver verificando auth, mostra loading ou tela em branco para evitar flash
  if (verifyingAuth) return null;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAF9] px-4 py-8 relative overflow-hidden font-poppins">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-[#49654E]/5 rounded-b-[3rem] -z-0"></div>

      <div className="w-full max-w-2xl bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-[#253528]/5 border border-[#8BA889]/10 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center mb-8">
          {/* Botão Voltar */}
          <div className="absolute left-8 top-8 hidden md:block">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-[#8BA889] hover:text-[#49654E]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          <div className="bg-[#49654E]/10 p-4 rounded-full mb-4">
            <Sprout className="h-8 w-8 text-[#49654E]" />
          </div>
          <h2 className="text-2xl font-bold text-[#253528]">
            Novo Usuário do Jardim
          </h2>
          <p className="mt-1 text-sm text-[#8BA889]">
            Preencha os dados para criar um novo perfil de cliente.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna 1 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="nome"
                  className="text-xs font-bold text-[#253528]/70 uppercase ml-1"
                >
                  Nome Completo
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
                  <Input
                    id="nome"
                    placeholder="Ex: Ana Silva"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    className="pl-10 bg-[#F9FBF9] border-[#8BA889]/20 focus:border-[#49654E] h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="cpf"
                  className="text-xs font-bold text-[#253528]/70 uppercase ml-1"
                >
                  CPF
                </Label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-3.5 h-4 w-4 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    required
                    value={formData.cpf}
                    onChange={handleChange}
                    className="pl-10 bg-[#F9FBF9] border-[#8BA889]/20 focus:border-[#49654E] h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-bold text-[#253528]/70 uppercase ml-1"
                >
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="cliente@email.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 bg-[#F9FBF9] border-[#8BA889]/20 focus:border-[#49654E] h-11 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Coluna 2 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="endereco"
                  className="text-xs font-bold text-[#253528]/70 uppercase ml-1"
                >
                  Endereço
                </Label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
                  <Input
                    id="endereco"
                    placeholder="Rua das Flores, 123"
                    required
                    value={formData.endereco}
                    onChange={handleChange}
                    className="pl-10 bg-[#F9FBF9] border-[#8BA889]/20 focus:border-[#49654E] h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="senha"
                  className="text-xs font-bold text-[#253528]/70 uppercase ml-1"
                >
                  Senha Provisória
                </Label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-3.5 h-4 w-4 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.senha}
                    onChange={handleChange}
                    className="pl-10 bg-[#F9FBF9] border-[#8BA889]/20 focus:border-[#49654E] h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmarSenha"
                  className="text-xs font-bold text-[#253528]/70 uppercase ml-1"
                >
                  Confirmar Senha
                </Label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-3.5 h-4 w-4 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
                  <Input
                    id="confirmarSenha"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    className="pl-10 bg-[#F9FBF9] border-[#8BA889]/20 focus:border-[#49654E] h-11 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#49654E] hover:bg-[#3d5441] text-white font-bold shadow-lg shadow-[#49654E]/20 mt-6 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...
              </>
            ) : (
              "Finalizar Cadastro"
            )}
          </Button>
        </form>
      </div>

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        onConfirm={alertState.onConfirm}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />
    </div>
  );
}
