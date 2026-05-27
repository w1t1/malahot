package com.malahot.controller;

import com.malahot.dto.request.MatchResultRequest;
import com.malahot.dto.response.Result;
import com.malahot.entity.MatchRecord;
import com.malahot.entity.Ranking;
import com.malahot.service.MatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "赛程与排名模块")
@RestController
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @Operation(summary = "生成对阵表（管理员）")
    @PostMapping("/matches/generate/{competitionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> generateBracket(@PathVariable Long competitionId) {
        matchService.generateBracket(competitionId);
        return Result.success();
    }

    @Operation(summary = "查看赛事全部对阵（公开）")
    @GetMapping("/matches/competition/{competitionId}")
    public Result<List<MatchRecord>> getMatchesByCompetition(@PathVariable Long competitionId) {
        return Result.success(matchService.getMatchesByCompetition(competitionId));
    }

    @Operation(summary = "查看某轮对阵（公开）")
    @GetMapping("/matches/competition/{competitionId}/round/{round}")
    public Result<List<MatchRecord>> getMatchesByRound(@PathVariable Long competitionId,
                                                        @PathVariable int round) {
        return Result.success(matchService.getMatchesByRound(competitionId, round));
    }

    @Operation(summary = "提交比赛结果（管理员）")
    @PostMapping("/matches/{matchId}/result")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> submitResult(@PathVariable Long matchId,
                                      @Valid @RequestBody MatchResultRequest request) {
        matchService.submitResult(matchId, request);
        return Result.success();
    }

    @Operation(summary = "查看赛事排名（公开）")
    @GetMapping("/rankings/competition/{competitionId}")
    public Result<List<Ranking>> getRankings(@PathVariable Long competitionId) {
        return Result.success(matchService.getRankings(competitionId));
    }
}
