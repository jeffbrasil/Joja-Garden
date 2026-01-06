import api from "./api";
import { IJardim, IJardimCreate } from "../types";

export const gardenService = {
  getAll: async () => {
    const response = await api.get<IJardim[]>("/jardins"); // Verifique a rota no jardim_router.py
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get<IJardim>(`/jardins/${id}`);
    return response.data;
  },
  create: async (data: IJardimCreate) => {
    const response = await api.post<IJardim>("/jardins", data);
    return response.data;
  },
};
