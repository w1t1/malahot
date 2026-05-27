package com.malahot.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.malahot.dto.request.CreateTeamRequest;
import com.malahot.dto.response.TeamDetailResponse;
import com.malahot.entity.*;
import com.malahot.enums.CompetitionStatus;
import com.malahot.enums.TeamStatus;
import com.malahot.mapper.*;
import com.malahot.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamMapper teamMapper;
    private final TeamMemberMapper teamMemberMapper;
    private final CompetitionMapper competitionMapper;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public Team createTeam(CreateTeamRequest request, Long userId) {
        Competition competition = competitionMapper.selectById(request.getCompetitionId());
        if (competition == null) {
            throw new RuntimeException("赛事不存在");
        }
        if (!CompetitionStatus.REGISTRATION.name().equals(competition.getStatus())) {
            throw new RuntimeException("赛事当前不在报名阶段");
        }
        if (LocalDateTime.now().isAfter(competition.getRegistrationEnd())) {
            throw new RuntimeException("报名已截止");
        }

        // Check if user already has a team in this competition
        Long existingTeamCount = teamMemberMapper.selectCount(
                new LambdaQueryWrapper<TeamMember>()
                        .eq(TeamMember::getUserId, userId)
                        .inSql(TeamMember::getTeamId,
                                "SELECT id FROM team WHERE competition_id = " + request.getCompetitionId()));
        if (existingTeamCount > 0) {
            throw new RuntimeException("你已经在该赛事中有战队了");
        }

        // Check team count limit
        Long teamCount = teamMapper.selectCount(
                new LambdaQueryWrapper<Team>()
                        .eq(Team::getCompetitionId, request.getCompetitionId())
                        .ne(Team::getStatus, TeamStatus.REJECTED.name()));
        if (teamCount >= competition.getMaxTeams()) {
            throw new RuntimeException("该赛事参赛队伍已满");
        }

        // Create team
        Team team = new Team();
        team.setName(request.getName());
        team.setLogo(request.getLogo());
        team.setCaptainId(userId);
        team.setCompetitionId(request.getCompetitionId());
        team.setInviteCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        team.setStatus(TeamStatus.PENDING.name());
        teamMapper.insert(team);

        // Add captain as member
        TeamMember member = new TeamMember();
        member.setTeamId(team.getId());
        member.setUserId(userId);
        member.setRole("CAPTAIN");
        member.setJoinedAt(LocalDateTime.now());
        teamMemberMapper.insert(member);

        return team;
    }

    @Override
    @Transactional
    public void joinTeam(String inviteCode, Long userId) {
        Team team = teamMapper.selectOne(
                new LambdaQueryWrapper<Team>().eq(Team::getInviteCode, inviteCode));
        if (team == null) {
            throw new RuntimeException("邀请码无效");
        }

        Competition competition = competitionMapper.selectById(team.getCompetitionId());
        if (!CompetitionStatus.REGISTRATION.name().equals(competition.getStatus())) {
            throw new RuntimeException("赛事当前不在报名阶段");
        }

        // Check if already in a team for this competition
        Long existingTeamCount = teamMemberMapper.selectCount(
                new LambdaQueryWrapper<TeamMember>()
                        .eq(TeamMember::getUserId, userId)
                        .inSql(TeamMember::getTeamId,
                                "SELECT id FROM team WHERE competition_id = " + team.getCompetitionId()));
        if (existingTeamCount > 0) {
            throw new RuntimeException("你已经在该赛事中有战队了");
        }

        // Check team size limit
        Long memberCount = teamMemberMapper.selectCount(
                new LambdaQueryWrapper<TeamMember>().eq(TeamMember::getTeamId, team.getId()));
        if (memberCount >= competition.getTeamSize()) {
            throw new RuntimeException("战队人数已满");
        }

        TeamMember member = new TeamMember();
        member.setTeamId(team.getId());
        member.setUserId(userId);
        member.setRole("MEMBER");
        member.setJoinedAt(LocalDateTime.now());
        teamMemberMapper.insert(member);
    }

    @Override
    @Transactional
    public void leaveTeam(Long teamId, Long userId) {
        Team team = teamMapper.selectById(teamId);
        if (team == null) {
            throw new RuntimeException("战队不存在");
        }
        if (team.getCaptainId().equals(userId)) {
            throw new RuntimeException("队长不能离队，请先转让队长或解散战队");
        }

        teamMemberMapper.delete(
                new LambdaQueryWrapper<TeamMember>()
                        .eq(TeamMember::getTeamId, teamId)
                        .eq(TeamMember::getUserId, userId));
    }

    @Override
    public TeamDetailResponse getTeamDetail(Long teamId) {
        Team team = teamMapper.selectById(teamId);
        if (team == null) {
            throw new RuntimeException("战队不存在");
        }

        List<TeamMember> members = teamMemberMapper.selectList(
                new LambdaQueryWrapper<TeamMember>().eq(TeamMember::getTeamId, teamId));

        List<TeamDetailResponse.MemberInfo> memberInfos = members.stream().map(m -> {
            User user = userMapper.selectById(m.getUserId());
            TeamDetailResponse.MemberInfo info = new TeamDetailResponse.MemberInfo();
            info.setUserId(m.getUserId());
            info.setNickname(user != null ? user.getNickname() : "未知");
            info.setAvatar(user != null ? user.getAvatar() : null);
            info.setRole(m.getRole());
            return info;
        }).toList();

        TeamDetailResponse response = new TeamDetailResponse();
        response.setTeam(team);
        response.setMembers(memberInfos);
        return response;
    }

    @Override
    public List<Team> getMyTeams(Long userId) {
        List<TeamMember> memberships = teamMemberMapper.selectList(
                new LambdaQueryWrapper<TeamMember>().eq(TeamMember::getUserId, userId));
        if (memberships.isEmpty()) {
            return List.of();
        }
        List<Long> teamIds = memberships.stream().map(TeamMember::getTeamId).toList();
        return teamMapper.selectBatchIds(teamIds);
    }

    @Override
    public IPage<Team> getTeamsByCompetition(Long competitionId, int page, int size, String status) {
        LambdaQueryWrapper<Team> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Team::getCompetitionId, competitionId);
        if (StringUtils.hasText(status)) {
            wrapper.eq(Team::getStatus, status);
        }
        wrapper.orderByDesc(Team::getCreatedAt);
        return teamMapper.selectPage(new Page<>(page, size), wrapper);
    }

    @Override
    public void approveTeam(Long teamId) {
        Team team = teamMapper.selectById(teamId);
        if (team == null) {
            throw new RuntimeException("战队不存在");
        }
        if (!TeamStatus.PENDING.name().equals(team.getStatus())) {
            throw new RuntimeException("只能审核待审核状态的战队");
        }
        team.setStatus(TeamStatus.APPROVED.name());
        teamMapper.updateById(team);
    }

    @Override
    public void rejectTeam(Long teamId) {
        Team team = teamMapper.selectById(teamId);
        if (team == null) {
            throw new RuntimeException("战队不存在");
        }
        if (!TeamStatus.PENDING.name().equals(team.getStatus())) {
            throw new RuntimeException("只能审核待审核状态的战队");
        }
        team.setStatus(TeamStatus.REJECTED.name());
        teamMapper.updateById(team);
    }
}
