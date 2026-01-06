import api from "./api";
import { IPlanta } from "../types";

export const catalogoService = {
  // Adicionei skip e limit opcionais, pois seu backend aceita eles
  getAll: async (skip = 0, limit = 25) => {
    
    // ATENÇÃO: Estou assumindo que o prefixo no main.py é "/catalogo".
    // Se não funcionar, tente tirar o "/catalogo" e deixar só "/visualizar"
    const response = await api.get<IPlanta[]>("/catalogo/visualizar", {
      params: {
        skip,
        limit
      }
    });
    
    return response.data;
  },

  getById: async (id: number) => {
    // Esse endpoint ainda não vi no seu código, mas mantenha o padrão
    const response = await api.get<IPlanta>(`/catalogo/${id}`);
    return response.data;
  }
};