import api from "./api";
import { IUser } from "../types";

export const userService = {
  getMe: async () => {
    const token = localStorage.getItem("joja_token");
    
    if (!token) {
        throw new Error("Sem token de autenticação");
    }

    try {
        // Rota exata do seu Swagger
        const response = await api.get<IUser>("/usuario/dados-cadastrais"); 
        return response.data;
    } catch (error) {
        // Se der erro aqui, provavelmente o token expirou
        console.error("Erro ao buscar dados do usuário:", error);
        throw error;
    }
  }
};