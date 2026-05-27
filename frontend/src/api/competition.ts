import api from './index';

export interface Competition {
  id: number;
  title: string;
  gameType: string;
  description: string;
  rules: string;
  coverImage: string | null;
  maxTeams: number;
  teamSize: number;
  format: string;
  registrationStart: string;
  registrationEnd: string;
  competitionStart: string | null;
  status: string;
  createdBy: number;
  createdAt: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface CompetitionRequest {
  title: string;
  gameType: string;
  description?: string;
  rules?: string;
  coverImage?: string;
  maxTeams: number;
  teamSize: number;
  format?: string;
  registrationStart: string;
  registrationEnd: string;
  competitionStart?: string;
}

export const competitionApi = {
  list: (params: { page?: number; size?: number; status?: string; gameType?: string }) =>
    api.get<any, { data: PageResult<Competition> }>('/competitions', { params }),
  getById: (id: number) =>
    api.get<any, { data: Competition }>(`/competitions/${id}`),
  create: (data: CompetitionRequest) =>
    api.post<any, { data: Competition }>('/competitions', data),
  update: (id: number, data: CompetitionRequest) =>
    api.put<any, { data: Competition }>(`/competitions/${id}`, data),
  updateStatus: (id: number, status: string) =>
    api.put(`/competitions/${id}/status`, null, { params: { status } }),
};
