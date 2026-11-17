export type Role = "user" | "admin";

export interface Usuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  disabled: boolean;
  created_at: string;
}

export interface Credenciales {
  username: string;
  password: string;
}

export interface Registro extends Credenciales {
  full_name: string;
  email: string;
}
