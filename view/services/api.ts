import axios from "axios";

const api = axios.create({
  // Ajuste a porta se seu FastAPI não estiver na 8000
  baseURL: "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  // Tenta pegar o token do localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("joja_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
