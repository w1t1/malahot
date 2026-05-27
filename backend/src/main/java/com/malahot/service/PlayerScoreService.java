package com.malahot.service;

import com.malahot.entity.Competition;
import com.malahot.entity.Team;

public interface PlayerScoreService {

    /**
     * 比赛结果出来后更新双方队员个人积分
     * 胜队每人 +1 分，败队不扣分，所有参赛队员场次 +1
     */
    void onMatchResult(Long winnerTeamId, Long loserTeamId);

    /**
     * 赛事结束时冠军队额外加分并记录冠军历史
     */
    void onChampion(Competition competition, Team championTeam);

    /**
     * 根据积分计算评级
     */
    String calculateRating(int score);
}
