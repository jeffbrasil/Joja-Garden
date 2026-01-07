"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  User,
  Shield,
  Key,
  Leaf,
  Loader2,
  AlertCircle,
  Mail,
  Hash,
} from "lucide-react";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { IUser } from "@/types";

export default function ManageUsersPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [cpfBusca, setCpfBusca] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<IUser | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Função auxiliar para máscara visual (enquanto digita)
  const formatarCpfVisual = (valor: string) => {
    return valor
      .replace(/\D/g, "") // Remove tudo que não é dígito
      .replace(/(\d{3})(\d)/, "$1.$2") // Coloca ponto após o 3º digito
      .replace(/(\d{3})(\d)/, "$1.$2") // Coloca ponto após o 6º digito
      .replace(/(\d{3})(\d{1,2})/, "$1-$2") // Coloca traço antes dos últimos 2
      .slice(0, 14); // Limita o tamanho
  };

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfBusca) return;

    setIsLoading(true);
    setErro("");
    setUsuarioEncontrado(null);

    // 1. Limpa: Deixa apenas os números para garantir a contagem correta
    const apenasNumeros = cpfBusca.replace(/\D/g, "");

    // 2. Validação básica de tamanho (CPF tem 11 dígitos)
    if (apenasNumeros.length !== 11) {
      setErro("CPF incompleto. Certifique-se de digitar os 11 números.");
      setIsLoading(false);
      return;
    }

    // 3. Formata: Transforma 12345678900 em 123.456.789-00
    const cpfFormatado = apenasNumeros.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4",
    );

    try {
      // 4. Envia o CPF formatado (com pontos e traço) para o serviço
      // Se o seu banco salva SEM pontos, mude aqui para enviar 'apenasNumeros'
      const data = await userService.getUserByCpf(cpfFormatado);
      setUsuarioEncontrado(data);
    } catch (error: any) {
      console.error("Erro ao buscar:", error);
      if (error.response?.status === 404) {
        setErro(`Usuário com CPF ${cpfFormatado} não encontrado.`);
      } else {
        setErro("Ocorreu um erro ao buscar o usuário.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-tertiary">
        <Shield className="w-16 h-16 mb-4 text-red-400" />
        <h2 className="text-xl font-bold text-primary">Acesso Restrito</h2>
        <p>Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-auto pb-10 relative min-h-screen bg-gray-50/30">
      {/* --- HEADER --- */}
      <div className="w-full bg-quaternary shadow-sm shadow-tertiary/20 py-8 px-6 md:px-12 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Gerenciar Usuários
            </h1>
            <p className="text-tertiary mt-1">
              Consulte usuários, altere senhas e gerencie jardins.
            </p>
          </div>

          {/* Barra de Busca (Hero Search) */}
          <form onSubmit={handleBuscar} className="w-full md:w-[500px]">
            <div className="flex items-center bg-quinquenary rounded-full px-4 py-2 w-full shadow-inner border border-tertiary/30 focus-within:border-secondary transition-colors relative">
              <Search className="text-tertiary w-5 h-5 mr-2" />
              <input
                type="text"
                value={cpfBusca}
                // Aplica a máscara visual enquanto o usuário digita
                onChange={(e) => setCpfBusca(formatarCpfVisual(e.target.value))}
                placeholder="Digite o CPF (apenas números ou formatado)..."
                maxLength={14}
                className="bg-transparent border-none outline-none text-primary placeholder-tertiary w-full text-sm h-10"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="absolute right-1 top-1 bottom-1 rounded-full bg-primary hover:bg-secondary text-white h-auto px-6 text-xs font-semibold uppercase tracking-wide"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Buscar"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* --- CONTEÚDO --- */}
      <div className="max-w-4xl w-full px-6 flex flex-col gap-6">
        {/* Mensagens de Erro */}
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{erro}</span>
          </div>
        )}

        {/* --- CARD DO USUÁRIO ENCONTRADO --- */}
        {usuarioEncontrado && (
          <div className="group bg-quaternary rounded-xl p-0 shadow-md shadow-tertiary/10 border border-transparent hover:border-tertiary/30 overflow-hidden transition-all duration-300">
            {/* Cabeçalho do Card */}
            <div className="bg-quinquenary/50 p-6 border-b border-tertiary/10 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-tertiary/20">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary leading-tight">
                    {usuarioEncontrado.nome}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      usuarioEncontrado.tipo_usuario?.toLowerCase() === "admin"
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-green-100 text-green-700 border border-green-200"
                    }`}
                  >
                    {usuarioEncontrado.tipo_usuario?.toLowerCase() ===
                      "admin" && <Shield className="w-3 h-3" />}
                    {usuarioEncontrado.tipo_usuario || "Usuário Comum"}
                  </span>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-xs text-tertiary font-mono bg-white px-2 py-1 rounded border border-tertiary/20">
                  ID: {usuarioEncontrado.id}
                </span>
              </div>
            </div>

            {/* Corpo do Card */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Coluna 1: Dados */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-tertiary uppercase tracking-wider border-b border-tertiary/20 pb-2 mb-4">
                  Dados Pessoais
                </h3>

                <div className="flex items-center gap-3 text-primary">
                  <Hash className="w-5 h-5 text-tertiary/70" />
                  <div>
                    <p className="text-xs text-tertiary">CPF</p>
                    <p className="font-medium">{usuarioEncontrado.cpf}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-primary">
                  <Mail className="w-5 h-5 text-tertiary/70" />
                  <div>
                    <p className="text-xs text-tertiary">E-mail</p>
                    <p className="font-medium">{usuarioEncontrado.email}</p>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Ações */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-tertiary uppercase tracking-wider border-b border-tertiary/20 pb-2 mb-4">
                  Ações Administrativas
                </h3>

                <div className="flex flex-col gap-3">
                  <Button
                    className="w-full bg-white border border-tertiary/30 text-primary hover:bg-quinquenary hover:border-secondary transition-all justify-start h-12 gap-3 shadow-sm"
                    onClick={() => {
                      router.push(
                        `/manage-users/change-password?id=${usuarioEncontrado.id}&nome=${encodeURIComponent(usuarioEncontrado.nome)}`,
                      );
                    }}
                  >
                    <div className="bg-amber-100 p-1.5 rounded text-amber-600">
                      <Key className="w-4 h-4" />
                    </div>
                    Alterar Senha
                  </Button>

                  <Button
                    className="w-full bg-white border border-tertiary/30 text-primary hover:bg-quinquenary hover:border-secondary transition-all justify-start h-12 gap-3 shadow-sm"
                    onClick={() => {
                      router.push(
                        `/manage-users/add-plant?id=${usuarioEncontrado.id}&nome=${encodeURIComponent(usuarioEncontrado.nome)}`,
                      );
                    }}
                  >
                    <div className="bg-green-100 p-1.5 rounded text-green-600">
                      <Leaf className="w-4 h-4" />
                    </div>
                    Adicionar Planta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estado vazio (Inicial) */}
        {!usuarioEncontrado && !isLoading && !erro && (
          <div className="flex flex-col items-center justify-center py-20 text-tertiary opacity-60">
            <Search className="w-16 h-16 mb-4 stroke-1" />
            <p className="text-lg">
              Utilize a busca acima para encontrar um usuário.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
