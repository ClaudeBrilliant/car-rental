export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'GUEST' | 'STAFF' | 'ADMIN';
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'GUEST' | 'STAFF' | 'ADMIN';
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'GUEST' | 'STAFF' | 'ADMIN';
}