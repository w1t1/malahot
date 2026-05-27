package com.malahot.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("match_record")
public class MatchRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long competitionId;

    private Integer round;

    private Integer matchOrder;

    private Long teamAId;

    private Long teamBId;

    private Integer scoreA;

    private Integer scoreB;

    private Long winnerId;

    private LocalDateTime scheduledAt;

    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
