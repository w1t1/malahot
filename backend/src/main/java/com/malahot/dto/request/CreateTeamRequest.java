package com.malahot.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateTeamRequest {

    @NotBlank(message = "战队名称不能为空")
    @Size(max = 50, message = "战队名称不超过50个字符")
    private String name;

    private String logo;

    @NotNull(message = "赛事ID不能为空")
    private Long competitionId;
}
