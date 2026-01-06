import api from "./api";
import { ILoginResponse } from "../types";

export const authService = {
  login: async (cpf: string, password: string) => {
    // 1. O Swagger pede "application/x-www-form-urlencoded".
    // No JavaScript, usamos URLSearchParams para criar esse formato.
    const params = new URLSearchParams();
    
    // 2. O backend espera o campo "username", mesmo sendo CPF.
    params.append('username', cpf); 
    params.append('password', password);

    // 3. A rota exata conforme sua foto
    const response = await api.post<ILoginResponse>("/auth/token", params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return response.data;
  },
  
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("joja_token", token);
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("joja_token");
      window.location.href = "/login";
    }
  }
};