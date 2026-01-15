// view/services/adminService.ts
import api from "./api";
import { IUser } from "@/types";

export const adminService = {
  // CORREÇÃO AQUI: Removido o "/admin" duplicado
  deleteAdmin: async (adminId: number) => {
    // Antes estava: /admin/admin/${adminId}
    // O correto é: /admin/${adminId}
    const response = await api.delete(`/admin/${adminId}`);
    return response.data;
  },

  getAdminById: async (id: string | number) => {
    const response = await api.get(`/admin/${id}?admin_in=${id}`);
    return response.data;
  },

  updateAdminPassword: async (
    id: number,
    dados: { senha_atual: string; nova_senha: string },
  ) => {
    const response = await api.put(`/admin/${id}/alterar-senha`, dados);
    return response.data;
  },
};
