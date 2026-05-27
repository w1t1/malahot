package com.malahot.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CompetitionRequest {

    @NotBlank(message = "赛事名称不能为空")
    @Size(max = 100, message = "赛事名称不超过100个字符")
    private String title;

    @NotBlank(message = "游戏类型不能为空")
    private String gameType;

    private String description;

    private String rules;

    private String coverImage;

    @NotNull(message = "最大队伍数不能为空")
    @Min(value = 2, message = "最少2支队伍")
    @Max(value = 128, message = "最多128支队伍")
    private Integer maxTeams;

    @NotNull(message = "每队人数不能为空")
    @Min(value = 1, message = "每队至少1人")
    @Max(value = 10, message = "每队最多10人")
    private Integer teamSize;

    private String format;

    @NotNull(message = "报名开始时间不能为空")
    private LocalDateTime registrationStart;

    @NotNull(message = "报名截止时间不能为空")
    private LocalDateTime registrationEnd;

    private LocalDateTime competitionStart;
}
