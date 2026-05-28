package com.malahot.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.malahot.entity.*;
import com.malahot.mapper.ChampionHistoryMapper;
import com.malahot.mapper.TeamMemberMapper;
import com.malahot.mapper.UserMapper;
import com.malahot.service.PlayerScoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlayerScoreServiceImpl implements PlayerScoreService {

    private final UserMapper userMapper;
    private final TeamMemberMapper teamMemberMapper;
    private final ChampionHistoryMapper championHistoryMapper;

    @Override
    public void onMatchResult(Long winnerTeamId, Long loserTeamId) {
        // 获取胜队所有队员
        List<TeamMember> winners = getTeamMembers(winnerTeamId);
        // 获取败队所有队员
        List<TeamMember> losers = getTeamMembers(loserTeamId);

        // 胜队队员：积分 +1, 场次 +1, 胜场 +1
        for (TeamMember tm : winners) {
            User user = userMapper.selectById(tm.getUserId());
            if (user != null) {
                user.setScore(user.getScore() + 1);
                user.setMatchesPlayed(user.getMatchesPlayed() + 1);
                user.setWins(user.getWins() + 1);
                user.setRating(calculateRating(user.getScore()));
                userMapper.updateById(user);
            }
        }

        // 败队队员：场次 +1（不扣分）
        for (TeamMember tm : losers) {
            User user = userMapper.selectById(tm.getUserId());
            if (user != null) {
                user.setMatchesPlayed(user.getMatchesPlayed() + 1);
                user.setRating(calculateRating(user.getScore()));
                userMapper.updateById(user);
            }
        }
    }

    @Override
    public void onChampion(Competition competition, Team championTeam) {
        // 冠军队所有队员额外加分
        List<TeamMember> members = getTeamMembers(championTeam.getId());
        int bonus = 5; // 冠军额外 +5 分

        List<String> memberNames = new java.util.ArrayList<>();
        String captainName = null;

        for (TeamMember tm : members) {
            User user = userMapper.selectById(tm.getUserId());
            if (user != null) {
                user.setScore(user.getScore() + bonus);
                user.setChampionCount(user.getChampionCount() != null ? user.getChampionCount() + 1 : 1);
                user.setRating(calculateRating(user.getScore()));
                userMapper.updateById(user);
                if (user.getNickname() != null) {
                    memberNames.add(user.getNickname());
                }
                if ("CAPTAIN".equals(tm.getRole())) {
                    captainName = user.getNickname();
                }
            }
        }

        // 记录冠军历史
        ChampionHistory history = new ChampionHistory();
        history.setCompetitionId(competition.getId());
        history.setSeasonName(competition.getTitle());
        history.setTeamName(championTeam.getName());
        history.setCaptainName(captainName);
        history.setMembers(String.join(", ", memberNames));
        history.setCrownedAt(LocalDateTime.now());
        championHistoryMapper.insert(history);

        log.info("Champion recorded: {} - team {} with members: {}",
                competition.getTitle(), championTeam.getName(), memberNames);
    }

    @Override
    public String calculateRating(int score) {
        if (score >= 80) return "SS";
        if (score >= 60) return "S";
        if (score >= 45) return "A";
        if (score >= 30) return "B";
        if (score >= 20) return "C";
        if (score >= 10) return "D";
        if (score >= 5) return "E";
        return "F";
    }

    private List<TeamMember> getTeamMembers(Long teamId) {
        return teamMemberMapper.selectList(
                new LambdaQueryWrapper<TeamMember>()
                        .eq(TeamMember::getTeamId, teamId));
    }
}
