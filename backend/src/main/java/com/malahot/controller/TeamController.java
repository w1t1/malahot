package com.malahot.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.malahot.dto.request.CreateTeamRequest;
import com.malahot.dto.request.JoinTeamRequest;
import com.malahot.dto.response.Result;
import com.malahot.dto.response.TeamDetailResponse;
import com.malahot.entity.Team;
import com.malahot.security.SecurityUtil;
import com.malahot.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "战队模块")
@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @Operation(summary = "创建战队")
    @PostMapping
    public Result<Team> createTeam(@Valid @RequestBody CreateTeamRequest request) {
        return Result.success(teamService.createTeam(request, SecurityUtil.getCurrentUserId()));
    }

    @Operation(summary = "通过邀请码加入战队")
    @PostMapping("/join")
    public Result<Void> joinTeam(@Valid @RequestBody JoinTeamRequest request) {
        teamService.joinTeam(request.getInviteCode(), SecurityUtil.getCurrentUserId());
        return Result.success();
    }

    @Operation(summary = "离开战队")
    @PostMapping("/{teamId}/leave")
    public Result<Void> leaveTeam(@PathVariable Long teamId) {
        teamService.leaveTeam(teamId, SecurityUtil.getCurrentUserId());
        return Result.success();
    }

    @Operation(summary = "战队详情")
    @GetMapping("/{teamId}")
    public Result<TeamDetailResponse> getTeamDetail(@PathVariable Long teamId) {
        return Result.success(teamService.getTeamDetail(teamId));
    }

    @Operation(summary = "我的战队列表")
    @GetMapping("/my")
    public Result<List<Team>> getMyTeams() {
        return Result.success(teamService.getMyTeams(SecurityUtil.getCurrentUserId()));
    }

    @Operation(summary = "赛事下的战队列表")
    @GetMapping("/competition/{competitionId}")
    public Result<IPage<Team>> getTeamsByCompetition(
            @PathVariable Long competitionId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return Result.success(teamService.getTeamsByCompetition(competitionId, page, size, status));
    }

    @Operation(summary = "审核通过战队（管理员）")
    @PutMapping("/{teamId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> approveTeam(@PathVariable Long teamId) {
        teamService.approveTeam(teamId);
        return Result.success();
    }

    @Operation(summary = "审核拒绝战队（管理员）")
    @PutMapping("/{teamId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> rejectTeam(@PathVariable Long teamId) {
        teamService.rejectTeam(teamId);
        return Result.success();
    }
}
