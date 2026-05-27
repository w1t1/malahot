import api from './index';

export interface Player {
  id: number;
  nickname: string;
  avatar: string | null;
  createdAt: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

export const playerApi = {
  list: (page = 1, size = 20, keyword?: string) =>
    api.get<any, { data: PageResult<Player> }>('/players', {
      params: { page, size, keyword },
    }),
};
