// Baseado em src/main/schemas/usuario_schema.py e auth
export interface IUser {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: "admin" | "usuario";
}

export interface ILoginResponse {
  access_token: string;
  token_type: string;
}

// Baseado em src/main/schemas/planta_catalogo_schema.py
export interface IPlanta {
  id?: number; // O banco geralmente retorna. Se não retornar, usaremos index.
  nome: string;
  nome_cientifico: string;
  categoria: string;
  familia: string;
  descricao: string;
  instrucoes_cuidado: string;
  img_url: string;
  periodicidade_rega: number;
  periodicidade_poda: number;
  periodicidade_adubo: number;
  // Notei que não tem 'preco' no seu backend, então removi daqui.
}

// Baseado em src/main/schemas/jardim_schema.py
export interface IJardim {
  id: number;
  nome: string;
  descricao?: string;
  usuario_id: number;
  plantas?: IPlanta[]; // Se o jardim vier com plantas
}

// Payload para criar jardim (o que enviamos)
export interface IJardimCreate {
  nome: string;
  descricao?: string;
  usuario_id: number;
}
