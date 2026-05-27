package com.malahot.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.malahot.dto.request.CompetitionRequest;
import com.malahot.dto.response.Result;
import com.malahot.entity.Competition;
import com.malahot.security.SecurityUtil;
import com.malahot.service.CompetitionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "赛事模块")
@RestController
@RequestMapping("/competitions")
@RequiredArgsConstructor
public class CompetitionController {

    private final CompetitionService competitionService;

    @Operation(summary = "创建赛事（管理员）")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Competition> create(@Valid @RequestBody CompetitionRequest request) {
        return Result.success(competitionService.create(request, SecurityUtil.getCurrentUserId()));
    }

    @Operation(summary = "编辑赛事（管理员）")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Competition> update(@PathVariable Long id,
                                       @Valid @RequestBody CompetitionRequest request) {
        return Result.success(competitionService.update(id, request, SecurityUtil.getCurrentUserId()));
    }

    @Operation(summary = "更新赛事状态（管理员）")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> updateStatus(@PathVariable Long id,
                                      @RequestParam String status) {
        competitionService.updateStatus(id, status, SecurityUtil.getCurrentUserId());
        return Result.success();
    }

    @Operation(summary = "赛事详情（公开）")
    @GetMapping("/{id}")
    public Result<Competition> getById(@PathVariable Long id) {
        return Result.success(competitionService.getById(id));
    }

    @Operation(summary = "赛事列表（公开）")
    @GetMapping
    public Result<IPage<Competition>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String gameType) {
        return Result.success(competitionService.list(page, size, status, gameType));
    }
}
