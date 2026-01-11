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
import api from "../services/api"; // Importe sua API para limpar headers no logout

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

  // Função de Logout (Centralizada e Robusta)
  const logout = () => {
    localStorage.removeItem("joja_token");
    // Limpa header do axios também
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("joja_token");

      if (!token) {
        setLoading(false);
        return;
      }

      // Se já tiver header configurado, ótimo. Se não, garante aqui.
      if (!api.defaults.headers.common["Authorization"]) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      console.log("AuthContext: Buscando dados do usuário...");
      const userData = await userService.getMe();

      setUser(userData);
    } catch (error) {
      console.error("AuthContext: Erro ao buscar usuário", error);
      // Opcional: Só desloga se for erro 401. Se for erro de rede, mantém o usuário na dúvida.
      logout();
    } finally {
      setLoading(false);
    }
  };

  // 1. O GRANDE CONSERTO:
  // Monitora o 'pathname'. Se mudar a rota e não tiver user, tenta buscar o token de novo.
  // Isso resolve o bug de sair do Login -> Home e tomar redirect.
  useEffect(() => {
    const token = localStorage.getItem("joja_token");

    if (!user && token) {
      // Se tem token mas não tem usuário (ex: acabou de logar), ativa loading e busca
      setLoading(true);
      refreshUser();
    } else if (!token && !user) {
      // Se não tem token nem user, para de carregar
      setLoading(false);
    }
  }, [pathname]); // <--- Roda sempre que mudar de página

  // 2. Carga inicial (mount)
  useEffect(() => {
    refreshUser();
  }, []);

  // 3. Proteção de rotas
  useEffect(() => {
    // Adicione a rota "/login/forgot-password" aqui na verificação
    const isPublicRoute =
      pathname === "/login" ||
      pathname === "/sign-up-user" ||
      pathname === "/login/forgot-password"; // <--- AQUI ESTÁ A CORREÇÃO

    // Adicionei !token na verificação para evitar redirect falso positivo
    const token =
      typeof window !== "undefined" ? localStorage.getItem("joja_token") : null;

    if (!loading && !user && !isPublicRoute && !token) {
      console.log("Rota protegida detectada sem usuário. Redirecionando...");
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  // --- LÓGICA DE ADMIN ---
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
