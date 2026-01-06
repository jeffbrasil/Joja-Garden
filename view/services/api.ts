import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// 1. Interceptor de REQUISIÇÃO (Antes de enviar)
// Ele pega o token do localStorage e coloca no cabeçalho automaticamente.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Verifica se está no navegador
    const token = localStorage.getItem("joja_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 2. Interceptor de RESPOSTA (Quando o backend responde)
// Aqui está o segredo: Se der erro 401, a gente força o logout.
api.interceptors.response.use(
  (response) => response, // Se deu certo, só passa
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se não for a tela de login, redireciona
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        console.warn("Sessão expirada ou inválida. Redirecionando...");
        localStorage.removeItem("joja_token"); // Limpa o token podre
        window.location.href = "/login"; // Força o reload para login
      }
    }
    return Promise.reject(error);
  },
);

export default api;
