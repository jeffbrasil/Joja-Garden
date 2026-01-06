import axios from "axios";
import api from "./api";

import { ILoginResponse } from "../types";

export const authService = {
  login: async (cpf: string, password: string) => {
      const params = new URLSearchParams();
      params.append('username', cpf); 
      params.append('password', password);
  
      // Chamada direta, sem usar a instância 'api'
      console.log("Tentando logar em http://localhost:8000/auth/token...");
      
      const response = await axios.post("http://localhost:8000/auth/token", params, {
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