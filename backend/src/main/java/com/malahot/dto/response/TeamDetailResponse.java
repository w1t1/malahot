package com.malahot.dto.response;

import com.malahot.entity.Team;
import com.malahot.entity.TeamMember;
import com.malahot.entity.User;
import lombok.Data;

import java.util.List;

@Data
public class TeamDetailResponse {
    private Team team;
    private List<MemberInfo> members;

    @Data
    public static class MemberInfo {
        private Long userId;
        private String nickname;
        private String avatar;
        private String role;
    }
}
