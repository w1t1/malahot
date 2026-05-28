package com.malahot.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.malahot.dto.response.Result;
import com.malahot.entity.ChampionHistory;
import com.malahot.entity.User;
import com.malahot.mapper.ChampionHistoryMapper;
import com.malahot.mapper.UserMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "选手模块")
@RestController
@RequestMapping("/players")
@RequiredArgsConstructor
public class PlayerController {

    private final UserMapper userMapper;
    private final ChampionHistoryMapper championHistoryMapper;

    @Operation(summary = "选手列表")
    @GetMapping
    public Result<Page<User>> listPlayers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        Page<User> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<User>()
                .eq(User::getRole, "PLAYER")
                .eq(User::getStatus, 1)
                .select(User::getId, User::getNickname, User::getAvatar, User::getScore,
                        User::getMatchesPlayed, User::getWins, User::getRating,
                        User::getChampionCount, User::getCreatedAt);
        if (keyword != null && !keyword.isBlank()) {
            wrapper.like(User::getNickname, keyword);
        }
        wrapper.orderByDesc(User::getScore);
        return Result.success(userMapper.selectPage(pageParam, wrapper));
    }

    @Operation(summary = "积分排行榜")
    @GetMapping("/leaderboard")
    public Result<List<User>> leaderboard(
            @RequestParam(defaultValue = "50") int limit) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<User>()
                .eq(User::getStatus, 1)
                .gt(User::getScore, 0)
                .select(User::getId, User::getNickname, User::getAvatar, User::getScore,
                        User::getMatchesPlayed, User::getWins, User::getRating,
                        User::getChampionCount)
                .orderByDesc(User::getScore)
                .last("LIMIT " + Math.min(limit, 100));
        return Result.success(userMapper.selectList(wrapper));
    }

    @Operation(summary = "历届冠军")
    @GetMapping("/champions")
    public Result<List<ChampionHistory>> champions() {
        return Result.success(championHistoryMapper.selectList(
                new LambdaQueryWrapper<ChampionHistory>()
                        .orderByDesc(ChampionHistory::getCrownedAt)));
    }
}
