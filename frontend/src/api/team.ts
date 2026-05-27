import api from './index';

export interface Team {
  id: number;
  name: string;
  logo: string | null;
  captainId: number;
  competitionId: number;
  inviteCode: string;
  status: string;
  createdAt: string;
}

export interface MemberInfo {
  userId: number;
  nickname: string;
  avatar: string | null;
  role: string;
}

export interface TeamDetail {
  team: Team;
  members: MemberInfo[];
}

export interface MatchRecord {
  id: number;
  competitionId: number;
  round: number;
  matchOrder: number;
  teamAId: number | null;
  teamBId: number | null;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: number | null;
  scheduledAt: string | null;
  status: string;
}

export interface Ranking {
  id: number;
  competitionId: number;
  teamId: number;
  wins: number;
  losses: number;
  points: number;
  rankPosition: number | null;
}

export const teamApi = {
  create: (data: { name: string; logo?: string; competitionId: number }) =>
    api.post<any, { data: Team }>('/teams', data),
  join: (inviteCode: string) =>
    api.post('/teams/join', { inviteCode }),
  leave: (teamId: number) =>
    api.post(`/teams/${teamId}/leave`),
  getDetail: (teamId: number) =>
    api.get<any, { data: TeamDetail }>(`/teams/${teamId}`),
  getMyTeams: () =>
    api.get<any, { data: Team[] }>('/teams/my'),
  getByCompetition: (competitionId: number, params?: { page?: number; size?: number; status?: string }) =>
    api.get(`/teams/competition/${competitionId}`, { params }),
  approve: (teamId: number) =>
    api.put(`/teams/${teamId}/approve`),
  reject: (teamId: number) =>
    api.put(`/teams/${teamId}/reject`),
};

export const matchApi = {
  generateBracket: (competitionId: number) =>
    api.post(`/matches/generate/${competitionId}`),
  getByCompetition: (competitionId: number) =>
    api.get<any, { data: MatchRecord[] }>(`/matches/competition/${competitionId}`),
  getByRound: (competitionId: number, round: number) =>
    api.get<any, { data: MatchRecord[] }>(`/matches/competition/${competitionId}/round/${round}`),
  submitResult: (matchId: number, data: { scoreA: number; scoreB: number }) =>
    api.post(`/matches/${matchId}/result`, data),
};

export const rankingApi = {
  getByCompetition: (competitionId: number) =>
    api.get<any, { data: Ranking[] }>(`/rankings/competition/${competitionId}`),
};
