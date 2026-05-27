package com.malahot.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("champion_history")
public class ChampionHistory {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long competitionId;

    private String seasonName;

    private String teamName;

    private String captainName;

    private String members;

    private LocalDateTime crownedAt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
