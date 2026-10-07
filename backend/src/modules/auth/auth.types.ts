import { UserRole } from '../../models/user.model.js';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyName?: string; // If role === 'recruiter'
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    publicSlug?: string;
  };
  tokens: AuthTokens;
}
