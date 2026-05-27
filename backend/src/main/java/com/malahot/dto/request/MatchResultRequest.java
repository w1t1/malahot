package com.malahot.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MatchResultRequest {

    @NotNull(message = "队伍A得分不能为空")
    private Integer scoreA;

    @NotNull(message = "队伍B得分不能为空")
    private Integer scoreB;
}
