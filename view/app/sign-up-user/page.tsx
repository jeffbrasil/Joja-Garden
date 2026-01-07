"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Sprout,
  Loader2,
  MapPin,
  Mail,
  User,
  Shield,
  KeyRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  useEffect(() => {
    const token = localStorage.getItem("joja_token");
    if (!token) {
      toast.error("Sessão expirada", { description: "Faça login novamente." });
      router.push("/login"); // Ajuste para sua rota de login
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.senha !== formData.confirmarSenha) {
      toast.error("As senhas não conferem");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("joja_token");

    if (!token) {
      toast.error("Erro de permissão", {
        description: "Você não está autenticado.",
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        nome: formData.nome,
        cpf: formData.cpf,
        email: formData.email,
        senha: formData.senha,
        endereco: formData.endereco,
      };

      // 2. ENVIAR O TOKEN NO HEADER (Authorization: Bearer ...)
      await axios.post("http://localhost:8000/usuario/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Usuário criado com sucesso!", {
        description: `Bem-vindo(a) ao jardim, ${formData.nome}.`,
      });

      // Redireciona de volta para a lista
      router.push("/admin/lista-usuarios");
    } catch (err: any) {
      console.error(err);
      // Tratamento específico para erro 401 (Token inválido/expirado)
      if (err.response?.status === 401) {
        toast.error("Sessão inválida", {
          description: "Seu login expirou ou você não tem permissão.",
        });
      } else {
        toast.error("Erro no cadastro", {
          description:
            err.response?.data?.detail ||
            "Não foi possível realizar o cadastro.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-poppins min-h-screen w-full flex justify-center items-center bg-quinquenary p-6">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-xl shadow-tertiary/10 border-tertiary/20">
        <CardHeader className="space-y-1 flex flex-col items-center text-center pb-2">
          <div className="bg-secondary/20 p-3 rounded-full mb-2">
            <Sprout size={32} className="text-secondary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Novo Usuário do Jardim
          </CardTitle>
          <CardDescription>
            Cadastre um novo cliente para gerenciar suas plantas.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Coluna Esquerda */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-2">
                  <User size={14} /> Nome Completo
                </Label>
                <Input
                  id="nome"
                  placeholder="Ex: Ana Silva"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="flex items-center gap-2">
                  <Shield size={14} /> CPF
                </Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  required
                  value={formData.cpf}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail size={14} /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endereco" className="flex items-center gap-2">
                  <MapPin size={14} /> Endereço
                </Label>
                <Input
                  id="endereco"
                  placeholder="Rua das Flores, 123"
                  required
                  value={formData.endereco}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="flex items-center gap-2">
                  <KeyRound size={14} /> Senha
                </Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.senha}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary hover:bg-primary text-quaternary font-bold transition-all h-12 text-md shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Salvando...
                  </>
                ) : (
                  "Cadastrar Usuário"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
