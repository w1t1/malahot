package com.malahot.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("team")
public class Team {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String logo;

    private Long captainId;

    private Long competitionId;

    private String inviteCode;

    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
