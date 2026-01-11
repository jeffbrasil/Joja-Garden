"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  ShieldCheck, 
  Loader2, 
  User, 
  Leaf, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff 
} from "lucide-react"; 

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/modals/alert-modal";

export default function SignUpAdmin() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    senha: "",
    confirmarSenha: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const closeAlert = () => setAlertState((prev) => ({ ...prev, isOpen: false }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Máscara simples de CPF
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
    
    // Validação de Senha
    if (formData.senha !== formData.confirmarSenha) {
      setAlertState({
        isOpen: true,
        title: "Senhas Divergentes",
        description: "Os campos de senha e confirmação não coincidem. Por favor, verifique.",
        variant: "warning",
        onConfirm: closeAlert
      });
      return;
    }

    setLoading(true);

    try {
      // Remove pontuação do CPF para enviar
      const cpfLimpo = formData.cpf.replace(/\D/g, "");

      const payload = {
        nome: formData.nome,
        cpf: cpfLimpo,
        senha: formData.senha
      };

      await axios.post("http://localhost:8000/admin/criar_conta", payload);

      // Sucesso
      setAlertState({
        isOpen: true,
        title: "Administrador Criado",
        description: `O acesso para ${formData.nome} foi configurado com sucesso.`,
        variant: "success",
        onConfirm: () => router.push("/admin/lista-usuarios")
      });

    } catch (err: any) {
      console.error(err);
      setAlertState({
        isOpen: true,
        title: "Falha no Cadastro",
        description: err.response?.data?.detail || "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "danger",
        onConfirm: closeAlert
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAF9] px-4 relative overflow-hidden font-poppins">
      
      {/* Elementos de Fundo */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#49654E]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#8BA889]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-[#253528]/5 border border-[#8BA889]/10 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4 group">
             <div className="absolute inset-0 bg-[#49654E]/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-500"></div>
             <div className="relative h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-[#49654E] to-[#253528] text-white shadow-lg">
                <ShieldCheck className="h-8 w-8" />
             </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#253528]">
            Novo Administrador
          </h2>
          <p className="mt-2 text-sm font-medium text-[#8BA889]">
            Configure um novo acesso de gestão
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Campo NOME */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-xs font-bold text-[#253528]/70 uppercase tracking-wide ml-1">Nome Completo</Label>
            <div className="relative group">
               <User className="absolute left-4 top-3.5 h-5 w-5 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
               <Input id="nome" placeholder="Ex: Carlos Gerente" required value={formData.nome} onChange={handleChange} 
                 className="pl-12 h-12 rounded-xl border-[#8BA889]/20 focus:ring-[#49654E]/20 bg-[#F9FBF9] focus:border-[#49654E] transition-all"
               />
            </div>
          </div>

          {/* Campo CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-xs font-bold text-[#253528]/70 uppercase tracking-wide ml-1">CPF</Label>
            <div className="relative group">
               <Leaf className="absolute left-4 top-3.5 h-5 w-5 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
               <Input id="cpf" placeholder="000.000.000-00" required value={formData.cpf} onChange={handleChange} 
                 className="pl-12 h-12 rounded-xl border-[#8BA889]/20 focus:ring-[#49654E]/20 bg-[#F9FBF9] focus:border-[#49654E] transition-all"
               />
            </div>
          </div>

          {/* Campo SENHA */}
          <div className="space-y-2">
            <Label htmlFor="senha" className="text-xs font-bold text-[#253528]/70 uppercase tracking-wide ml-1">Senha</Label>
            <div className="relative group">
               <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
               <Input id="senha" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={formData.senha} onChange={handleChange} 
                 className="pl-12 pr-12 h-12 rounded-xl border-[#8BA889]/20 focus:ring-[#49654E]/20 bg-[#F9FBF9] focus:border-[#49654E] transition-all"
               />
               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-[#8BA889] hover:text-[#49654E]">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
               </button>
            </div>
          </div>

          {/* Confirmação de SENHA */}
          <div className="space-y-2">
            <Label htmlFor="confirmarSenha" className="text-xs font-bold text-[#253528]/70 uppercase tracking-wide ml-1">Confirmar Senha</Label>
            <div className="relative group">
               <Lock className="absolute left-4 top-3.5 h-5 w-5 text-[#8BA889] group-focus-within:text-[#49654E] transition-colors" />
               <Input id="confirmarSenha" type="password" placeholder="••••••••" required value={formData.confirmarSenha} onChange={handleChange} 
                 className="pl-12 h-12 rounded-xl border-[#8BA889]/20 focus:ring-[#49654E]/20 bg-[#F9FBF9] focus:border-[#49654E] transition-all"
               />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#49654E] hover:bg-[#3d5441] text-white font-bold shadow-lg shadow-[#49654E]/20 mt-4 transition-all">
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando...</> : "Criar Administrador"}
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