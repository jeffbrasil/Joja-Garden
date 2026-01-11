// view/services/adminService.ts
import api from "./api"; // Sua instância do Axios
import { IUser } from "@/types"; // Ou a tipagem que você usa para admin

export const adminService = {
  deleteAdmin: async (adminId: number) => {
    // O endpoint conforme imagem: DELETE /admin/admin/{admin_id}
    const response = await api.delete(`/admin/admin/${adminId}`);
    return response.data;
  },

  // Busca admin pelo ID (conforme sua foto 1)
  getAdminById: async (id: string | number) => {
    const response = await api.get(`/admin/${id}?admin_in=${id}`);
    return response.data;
  },

  // (Opcional) Função para mudar senha que usaremos na próxima página
  updateAdminPassword: async (
    id: string | number,
    dados: { senha_atual: string; nova_senha: string },
  ) => {
    // Ajuste a URL conforme sua rota exata. Na imagem parece ser /admin/{id}/alterar-senha
    const response = await api.put(`/admin/${id}/alterar-senha`, dados);
    return response.data;
  },
};
