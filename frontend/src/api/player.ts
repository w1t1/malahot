import api from './index';

export interface Player {
  id: number;
  nickname: string;
  avatar: string | null;
  score: number;
  matchesPlayed: number;
  wins: number;
  rating: string;
  createdAt: string;
}

export interface ChampionRecord {
  id: number;
  competitionId: number;
  seasonName: string;
  teamName: string;
  captainName: string | null;
  members: string | null;
  crownedAt: string;
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
  leaderboard: (limit = 50) =>
    api.get<any, { data: Player[] }>('/players/leaderboard', {
      params: { limit },
    }),
  champions: () =>
    api.get<any, { data: ChampionRecord[] }>('/players/champions'),
};
