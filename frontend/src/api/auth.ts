import api from './index';

export interface LoginResponse {
  token: string;
  userId: number;
  nickname: string;
  phone: string;
  role: string;
  avatar: string | null;
}

export interface User {
  id: number;
  phone: string;
  nickname: string;
  avatar: string | null;
  role: string;
  status: number;
}

export const authApi = {
  sendCode: (phone: string) => api.post('/auth/send-code', { phone }),
  login: (phone: string, code: string) =>
    api.post<any, { data: LoginResponse }>('/auth/login', { phone, code }),
  getMe: () => api.get<any, { data: User }>('/auth/me'),
  updateMe: (data: { nickname?: string; avatar?: string }) =>
    api.put('/auth/me', data),
};
