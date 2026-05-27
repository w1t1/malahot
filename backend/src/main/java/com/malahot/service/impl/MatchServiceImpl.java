package com.malahot.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.malahot.dto.request.MatchResultRequest;
import com.malahot.entity.*;
import com.malahot.enums.CompetitionStatus;
import com.malahot.enums.MatchStatus;
import com.malahot.enums.TeamStatus;
import com.malahot.mapper.*;
import com.malahot.service.MatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRecordMapper matchRecordMapper;
    private final CompetitionMapper competitionMapper;
    private final TeamMapper teamMapper;
    private final RankingMapper rankingMapper;

    @Override
    @Transactional
    public void generateBracket(Long competitionId) {
        Competition competition = competitionMapper.selectById(competitionId);
        if (competition == null) {
            throw new RuntimeException("赛事不存在");
        }
        if (!CompetitionStatus.IN_PROGRESS.name().equals(competition.getStatus())) {
            throw new RuntimeException("赛事必须处于进行中状态才能生成对阵表");
        }

        // Check if bracket already exists
        Long existingCount = matchRecordMapper.selectCount(
                new LambdaQueryWrapper<MatchRecord>().eq(MatchRecord::getCompetitionId, competitionId));
        if (existingCount > 0) {
            throw new RuntimeException("对阵表已存在，请勿重复生成");
        }

        // Get approved teams
        List<Team> teams = teamMapper.selectList(
                new LambdaQueryWrapper<Team>()
                        .eq(Team::getCompetitionId, competitionId)
                        .eq(Team::getStatus, TeamStatus.APPROVED.name()));

        if (teams.size() < 2) {
            throw new RuntimeException("至少需要2支审核通过的队伍才能生成对阵表");
        }

        // Shuffle teams for random seeding
        Collections.shuffle(teams);

        // Generate single elimination bracket
        generateSingleEliminationBracket(competitionId, teams);

        // Initialize rankings
        for (Team team : teams) {
            Ranking ranking = new Ranking();
            ranking.setCompetitionId(competitionId);
            ranking.setTeamId(team.getId());
            ranking.setWins(0);
            ranking.setLosses(0);
            ranking.setPoints(0);
            rankingMapper.insert(ranking);
        }
    }

    private void generateSingleEliminationBracket(Long competitionId, List<Team> teams) {
        int teamCount = teams.size();
        // Find next power of 2
        int bracketSize = 1;
        while (bracketSize < teamCount) {
            bracketSize *= 2;
        }

        int totalRounds = (int) (Math.log(bracketSize) / Math.log(2));

        // Round 1: assign teams, some get byes
        int matchesInRound1 = bracketSize / 2;
        int byes = bracketSize - teamCount;
        List<MatchRecord> round1Matches = new ArrayList<>();

        int teamIndex = 0;
        for (int i = 0; i < matchesInRound1; i++) {
            MatchRecord match = new MatchRecord();
            match.setCompetitionId(competitionId);
            match.setRound(1);
            match.setMatchOrder(i + 1);
            match.setStatus(MatchStatus.PENDING.name());

            if (teamIndex < teamCount) {
                match.setTeamAId(teams.get(teamIndex++).getId());
            }

            if (i >= byes && teamIndex < teamCount) {
                match.setTeamBId(teams.get(teamIndex++).getId());
            } else if (i < byes) {
                // Bye: team A auto-wins
                match.setTeamBId(null);
                if (match.getTeamAId() != null) {
                    match.setWinnerId(match.getTeamAId());
                    match.setStatus(MatchStatus.FINISHED.name());
                }
            }

            matchRecordMapper.insert(match);
            round1Matches.add(match);
        }

        // Generate subsequent rounds (empty slots)
        for (int round = 2; round <= totalRounds; round++) {
            int matchesInRound = bracketSize / (int) Math.pow(2, round);
            for (int i = 0; i < matchesInRound; i++) {
                MatchRecord match = new MatchRecord();
                match.setCompetitionId(competitionId);
                match.setRound(round);
                match.setMatchOrder(i + 1);
                match.setStatus(MatchStatus.PENDING.name());
                matchRecordMapper.insert(match);
            }
        }

        // Auto-advance bye winners to round 2
        advanceByeWinners(competitionId, round1Matches, bracketSize);
    }

    private void advanceByeWinners(Long competitionId, List<MatchRecord> round1Matches, int bracketSize) {
        List<MatchRecord> round2Matches = matchRecordMapper.selectList(
                new LambdaQueryWrapper<MatchRecord>()
                        .eq(MatchRecord::getCompetitionId, competitionId)
                        .eq(MatchRecord::getRound, 2)
                        .orderByAsc(MatchRecord::getMatchOrder));

        for (int i = 0; i < round1Matches.size(); i += 2) {
            int round2Index = i / 2;
            if (round2Index >= round2Matches.size()) break;

            MatchRecord round2Match = round2Matches.get(round2Index);
            MatchRecord matchA = round1Matches.get(i);
            MatchRecord matchB = (i + 1 < round1Matches.size()) ? round1Matches.get(i + 1) : null;

            if (matchA.getWinnerId() != null) {
                round2Match.setTeamAId(matchA.getWinnerId());
            }
            if (matchB != null && matchB.getWinnerId() != null) {
                round2Match.setTeamBId(matchB.getWinnerId());
            }
            matchRecordMapper.updateById(round2Match);
        }
    }

    @Override
    public List<MatchRecord> getMatchesByCompetition(Long competitionId) {
        return matchRecordMapper.selectList(
                new LambdaQueryWrapper<MatchRecord>()
                        .eq(MatchRecord::getCompetitionId, competitionId)
                        .orderByAsc(MatchRecord::getRound)
                        .orderByAsc(MatchRecord::getMatchOrder));
    }

    @Override
    public List<MatchRecord> getMatchesByRound(Long competitionId, int round) {
        return matchRecordMapper.selectList(
                new LambdaQueryWrapper<MatchRecord>()
                        .eq(MatchRecord::getCompetitionId, competitionId)
                        .eq(MatchRecord::getRound, round)
                        .orderByAsc(MatchRecord::getMatchOrder));
    }

    @Override
    @Transactional
    public void submitResult(Long matchId, MatchResultRequest request) {
        MatchRecord match = matchRecordMapper.selectById(matchId);
        if (match == null) {
            throw new RuntimeException("比赛不存在");
        }
        if (MatchStatus.FINISHED.name().equals(match.getStatus())) {
            throw new RuntimeException("比赛已结束，不能修改结果");
        }
        if (match.getTeamAId() == null || match.getTeamBId() == null) {
            throw new RuntimeException("对阵双方不完整，无法提交结果");
        }

        match.setScoreA(request.getScoreA());
        match.setScoreB(request.getScoreB());
        match.setStatus(MatchStatus.FINISHED.name());

        // Determine winner
        Long winnerId;
        Long loserId;
        if (request.getScoreA() > request.getScoreB()) {
            winnerId = match.getTeamAId();
            loserId = match.getTeamBId();
        } else if (request.getScoreB() > request.getScoreA()) {
            winnerId = match.getTeamBId();
            loserId = match.getTeamAId();
        } else {
            throw new RuntimeException("淘汰赛不允许平局");
        }

        match.setWinnerId(winnerId);
        matchRecordMapper.updateById(match);

        // Update rankings
        updateRanking(match.getCompetitionId(), winnerId, true);
        updateRanking(match.getCompetitionId(), loserId, false);

        // Mark loser team as eliminated
        Team loserTeam = teamMapper.selectById(loserId);
        if (loserTeam != null) {
            loserTeam.setStatus(TeamStatus.ELIMINATED.name());
            teamMapper.updateById(loserTeam);
        }

        // Advance winner to next round
        advanceWinner(match);

        // Check if competition is finished
        checkCompetitionFinished(match.getCompetitionId(), winnerId);
    }

    private void advanceWinner(MatchRecord match) {
        int nextRound = match.getRound() + 1;
        int nextMatchOrder = (match.getMatchOrder() + 1) / 2;

        MatchRecord nextMatch = matchRecordMapper.selectOne(
                new LambdaQueryWrapper<MatchRecord>()
                        .eq(MatchRecord::getCompetitionId, match.getCompetitionId())
                        .eq(MatchRecord::getRound, nextRound)
                        .eq(MatchRecord::getMatchOrder, nextMatchOrder));

        if (nextMatch != null) {
            if (match.getMatchOrder() % 2 == 1) {
                nextMatch.setTeamAId(match.getWinnerId());
            } else {
                nextMatch.setTeamBId(match.getWinnerId());
            }
            matchRecordMapper.updateById(nextMatch);
        }
    }

    private void checkCompetitionFinished(Long competitionId, Long winnerId) {
        // Check if all matches are finished
        Long pendingCount = matchRecordMapper.selectCount(
                new LambdaQueryWrapper<MatchRecord>()
                        .eq(MatchRecord::getCompetitionId, competitionId)
                        .ne(MatchRecord::getStatus, MatchStatus.FINISHED.name()));

        if (pendingCount == 0) {
            // All matches done — mark competition finished
            Competition competition = competitionMapper.selectById(competitionId);
            competition.setStatus(CompetitionStatus.FINISHED.name());
            competitionMapper.updateById(competition);

            // Mark winner as champion
            Team championTeam = teamMapper.selectById(winnerId);
            if (championTeam != null) {
                championTeam.setStatus(TeamStatus.CHAMPION.name());
                teamMapper.updateById(championTeam);
            }

            // Update final rankings
            updateFinalRankings(competitionId);
        }
    }

    private void updateRanking(Long competitionId, Long teamId, boolean isWin) {
        Ranking ranking = rankingMapper.selectOne(
                new LambdaQueryWrapper<Ranking>()
                        .eq(Ranking::getCompetitionId, competitionId)
                        .eq(Ranking::getTeamId, teamId));

        if (ranking != null) {
            if (isWin) {
                ranking.setWins(ranking.getWins() + 1);
                ranking.setPoints(ranking.getPoints() + 3);
            } else {
                ranking.setLosses(ranking.getLosses() + 1);
            }
            rankingMapper.updateById(ranking);
        }
    }

    private void updateFinalRankings(Long competitionId) {
        List<Ranking> rankings = rankingMapper.selectList(
                new LambdaQueryWrapper<Ranking>()
                        .eq(Ranking::getCompetitionId, competitionId)
                        .orderByDesc(Ranking::getPoints)
                        .orderByDesc(Ranking::getWins)
                        .orderByAsc(Ranking::getLosses));

        for (int i = 0; i < rankings.size(); i++) {
            rankings.get(i).setRankPosition(i + 1);
            rankingMapper.updateById(rankings.get(i));
        }
    }

    @Override
    public List<Ranking> getRankings(Long competitionId) {
        return rankingMapper.selectList(
                new LambdaQueryWrapper<Ranking>()
                        .eq(Ranking::getCompetitionId, competitionId)
                        .orderByAsc(Ranking::getRankPosition)
                        .orderByDesc(Ranking::getPoints));
    }
}
