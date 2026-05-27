package com.malahot.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinTeamRequest {

    @NotBlank(message = "邀请码不能为空")
    private String inviteCode;
}
