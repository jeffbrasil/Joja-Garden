import api from "./api";
import { IUser } from "../types";

export const userService = {
  getMe: async () => {
    // Rota exata do seu Swagger
    const response = await api.get<IUser>("/usuario/dados-cadastrais"); 
    return response.data;
  }
};