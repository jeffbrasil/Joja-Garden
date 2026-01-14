import api from "@/services/api";

const TOKEN_KEY = "joja_token";

export const authService = {
  getEmailByCpf: async (cpf: string) => {
    const response = await api.get("/usuario/email", {
      params: {
        cpf: cpf,
      },
    });

    return response.data;
  },

  // 2. Redefine a senha
  resetPassword: async (novaSenha: string) => {
    const response = await api.put("/usuario/esqueceu-senha", {
      nova_senha: novaSenha,
    });
    return response.data;
  },

  login: async (cpf: string, password: string) => {
    const params = new URLSearchParams();
    params.append("username", cpf);
    params.append("password", password);

    const response = await api.post(`/auth/token`, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  },

  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      // 1. Limpa o storage
      localStorage.removeItem("joja_token");

      delete api.defaults.headers.common["Authorization"];

      // 3. Força o reload para zerar qualquer estado React (Zustand/Context)
      window.location.href = "/login";
    }
  },
};
