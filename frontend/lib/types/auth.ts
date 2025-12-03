export interface User {
  id: string;
  name: string;
  email: string;
  dni: string;
  role: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  dni: string;
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  dni: string;
  role: number;
  accessToken: string;
}
