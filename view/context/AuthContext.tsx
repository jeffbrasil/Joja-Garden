"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { userService } from "../services/userService";
import { IUser } from "../types";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: IUser | null;
  isAdmin: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Função de Logout
  const logout = () => {
    localStorage.removeItem("joja_token");
    setUser(null);
    router.push("/login");
  };

  // Função para recarregar usuário (Persistência ao dar F5)
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("joja_token");
      
      if (!token) {
        console.log("AuthContext: Sem token, parando carregamento.");
        setLoading(false);
        return;
      }

      console.log("AuthContext: Buscando dados do usuário...");
      const userData = await userService.getMe();
      
      console.log("AuthContext: Dados recebidos!", userData);
      setUser(userData);

    } catch (error) {
      console.error("AuthContext: Erro ao buscar usuário (Token inválido ou erro de rede)", error);
      // Se der erro (ex: token expirou), fazemos logout para limpar
      logout();
    } finally {
      setLoading(false);
    }
  };

  // 1. Busca o usuário assim que a página carrega
  useEffect(() => {
    refreshUser();
  }, []);

  // 2. Proteção de rotas
  useEffect(() => {
    const isPublicRoute = pathname === "/login" || pathname === "/sign-up-user";

    // Só redireciona se JÁ terminou de carregar (!loading) e NÃO tem usuário
    if (!loading && !user && !isPublicRoute) {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  // --- LÓGICA DE ADMIN ---
  // Verifica se o usuário existe E se é admin (converte para minúsculo para evitar erros)
  const isAdmin = user?.tipo_usuario?.toLowerCase() === "admin";

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, loading, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);