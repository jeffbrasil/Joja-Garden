"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ShieldCheck, Loader2, User, Leaf, KeyRound, Lock } from "lucide-react"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SignUpAdmin() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    senha: "",
    confirmarSenha: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validação básica de senha no frontend
    if (formData.senha !== formData.confirmarSenha) {
      toast.error("As senhas não coincidem", {
        description: "Verifique se digitou a mesma senha nos dois campos.",
      });
      setLoading(false);
      return;
    }

    try {
      // Montagem do payload conforme sua imagem do Swagger (image_0390a3.png)
      // Endpoint: /admin/criar_conta
      // Campos: nome, cpf, senha
      const payload = {
        nome: formData.nome,
        cpf: formData.cpf, // Dica: Se o banco reclamar de pontuação, use .replace(/\D/g, "")
        senha: formData.senha
      };

      // Ajuste a URL base se não for localhost:8000
      await axios.post("http://localhost:8000/admin/criar_conta", payload);

      toast.success("Administrador criado!", {
        description: `O admin ${formData.nome} foi cadastrado com sucesso.`,
      });

      // Redireciona para a lista de usuários ou login
      router.push("/admin/lista-usuarios"); 

    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao cadastrar", {
        description: err.response?.data?.detail || "Falha ao conectar com o servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-poppins min-h-screen w-full flex justify-center items-center bg-quinquenary p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl shadow-tertiary/10 border-tertiary/20">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="bg-primary/10 p-3 rounded-full mb-2 border border-primary/20">
            <ShieldCheck size={32} className="text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Novo Administrador
          </CardTitle>
          <CardDescription>
            Crie um acesso administrativo para o sistema.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campo NOME */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2 text-primary font-medium">
                <User size={16} /> Nome Completo
              </Label>
              <Input id="nome" placeholder="Ex: Carlos Gerente" required value={formData.nome} onChange={handleChange} className="focus-visible:ring-primary"/>
            </div>

            {/* Campo CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf" className="flex items-center gap-2 text-primary font-medium">
                <Leaf size={16} /> CPF
              </Label>
              <Input id="cpf" placeholder="000.000.000-00" required value={formData.cpf} onChange={handleChange} className="focus-visible:ring-primary"/>
            </div>

            {/* Campo SENHA */}
            <div className="space-y-2">
              <Label htmlFor="senha" className="flex items-center gap-2 text-primary font-medium">
                <KeyRound size={16} /> Senha
              </Label>
              <Input id="senha" type="password" placeholder="••••••••" required value={formData.senha} onChange={handleChange} className="focus-visible:ring-primary"/>
            </div>

            {/* Confirmação de SENHA */}
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha" className="flex items-center gap-2 text-primary font-medium">
                <Lock size={16} /> Confirmar Senha
              </Label>
              <Input id="confirmarSenha" type="password" placeholder="••••••••" required value={formData.confirmarSenha} onChange={handleChange} className="focus-visible:ring-primary"/>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-secondary text-white font-bold transition-all h-11 text-md shadow-lg shadow-primary/20 mt-4">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</> : "Criar Administrador"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}