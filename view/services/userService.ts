import api from "./api";
import { IUser } from "../types";

export const userService = {
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
  
  /**
   * FUNÇÃO NOVA: Permite a um ADMIN alterar a senha de qualquer usuário.
   * Baseado no endpoint PUT /admin/{admin_id}/alterar-senha (da imagem image_0.png)
   */
  changeUserPasswordByAdmin: async (
    targetUserId: number,
    newPassword: string,
  ) => {
    try {
      // O corpo da requisição espera um JSON com o campo "senha"
      // Ajuste se o backend esperar outro nome (ex: "nova_senha")
      await api.put(`/admin/${targetUserId}/alterar-senha`, {
        senha_atual: "Senhaboa321",
        nova_senha: newPassword,
      });
    } catch (error) {
      console.error(
        `Erro ao alterar a senha do usuário ID ${targetUserId}:`,
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

  // --- (Futuro) Alterar senha de Admin ---
  updateAdminPassword: async (adminId: number, novaSenha: string) => {
    try {
      await api.put(`/admin/${adminId}/alterar-senha`, { senha: novaSenha });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      throw error;
    }
  },
};
