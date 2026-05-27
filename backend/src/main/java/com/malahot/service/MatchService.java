package com.malahot.service;

import com.malahot.dto.request.MatchResultRequest;
import com.malahot.entity.MatchRecord;
import com.malahot.entity.Ranking;

import java.util.List;

public interface MatchService {

    void generateBracket(Long competitionId);

    List<MatchRecord> getMatchesByCompetition(Long competitionId);

    List<MatchRecord> getMatchesByRound(Long competitionId, int round);

    void submitResult(Long matchId, MatchResultRequest request);

    List<Ranking> getRankings(Long competitionId);
}
