import axios from "axios";

// Constante para evitar erros de digitação
export const TOKEN_KEY = "joja_token";

const api = axios.create({
  // Usa variável de ambiente ou fallback
  baseURL: "" || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// =================================================================
// 1. Interceptor de REQUISIÇÃO (Manda o Token)
// =================================================================
api.interceptors.request.use(
  // 1º Argumento: SUCESSO (Antes de enviar a requisição)
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY);

      // Garante que headers existe antes de injetar
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  // 2º Argumento: ERRO (Erro ao tentar montar a requisição)
  (error) => {
    return Promise.reject(error);
  }
);

// =================================================================
// 2. Interceptor de RESPOSTA (Trata o Erro 401)
// =================================================================
api.interceptors.response.use(
  // 1º Argumento: SUCESSO (O backend respondeu 2xx)
  (response) => response,
  // 2º Argumento: ERRO (O backend respondeu 4xx, 5xx ou caiu a net)
  (error) => {
    // Verifica se erro existe e se é 401
    if (error.response?.status === 401) {
      
      // LOG DE DEBUG (Para você descobrir o problema do loop)
      console.error("ERRO 401 DETECTADO NA URL:", error.config?.url);

      if (typeof window !== "undefined") {
        // Previne loop se já estiver no login
        if (!window.location.pathname.includes("/login")) {
          console.warn("Sessão expirada. Redirecionando...");
          localStorage.removeItem(TOKEN_KEY);

          // Força reload para limpar memória
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;