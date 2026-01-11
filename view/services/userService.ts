import api from "./api";
import { IUser } from "../types";

export const userService = {
  deleteUser: async (userId: number) => {
    // O endpoint baseado na imagem enviada: DELETE /usuario/{user_id}
    const response = await api.delete(`/usuario/${userId}`);
    return response.data;
  },

  // Rota baseada na sua imagem: PUT /usuario/alterar-senha
  updatePassword: async (dados: {
    senha_atual: string;
    nova_senha: string;
  }) => {
    try {
      const response = await api.put("/usuario/alterar-senha", dados);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  /**
   * Adiciona uma planta do catálogo ao usuário específico.
   * Endpoint: POST /planta/usuario/{usuario_id}/adicionar
   */
  addPlantToUser: async (
    targetUserId: number,
    plantData: { id: number; apelido: string; data_plantio: string },
  ) => {
    try {
      // O 'id' no body refere-se ao ID da planta no catálogo que estamos adicionando
      await api.post(`/planta/usuario/${targetUserId}/adicionar`, plantData);
    } catch (error) {
      console.error(
        `Erro ao adicionar planta ao usuário ${targetUserId}:`,
        error,
      );
      throw error;
    }
  },

  // --- Busca quem está logado (seu método original) ---
  getMe: async () => {
    const token = localStorage.getItem("joja_token");

    if (!token) {
      throw new Error("Sem token de autenticação");
    }

    try {
      const response = await api.get<IUser>("/usuario/dados-cadastrais");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      throw error;
    }
  },

  // --- Busca outro usuário pelo CPF ---
  getUserByCpf: async (cpf: string) => {
    try {
      // Como mostra na imagem, o endpoint é "/usuario/dados"
      // e o parâmetro 'cpf' é do tipo "query" (vem depois do ? na URL)
      const response = await api.get<IUser>("/usuario/dados", {
        params: {
          cpf: cpf,
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar usuário com CPF ${cpf}:`, error);
      throw error;
    }
  },
};
