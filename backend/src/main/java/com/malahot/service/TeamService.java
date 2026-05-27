package com.malahot.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.malahot.dto.request.CreateTeamRequest;
import com.malahot.dto.response.TeamDetailResponse;
import com.malahot.entity.Team;

import java.util.List;

public interface TeamService {

    Team createTeam(CreateTeamRequest request, Long userId);

    void joinTeam(String inviteCode, Long userId);

    void leaveTeam(Long teamId, Long userId);

    TeamDetailResponse getTeamDetail(Long teamId);

    List<Team> getMyTeams(Long userId);

    IPage<Team> getTeamsByCompetition(Long competitionId, int page, int size, String status);

    void approveTeam(Long teamId);

    void rejectTeam(Long teamId);
}
