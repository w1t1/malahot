package com.malahot.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ranking")
public class Ranking {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long competitionId;

    private Long teamId;

    private Integer wins;

    private Integer losses;

    private Integer points;

    private Integer rankPosition;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
