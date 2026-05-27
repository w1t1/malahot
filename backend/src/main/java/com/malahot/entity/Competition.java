package com.malahot.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("competition")
public class Competition {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String gameType;

    private String description;

    private String rules;

    private String coverImage;

    private Integer maxTeams;

    private Integer teamSize;

    private String format;

    private LocalDateTime registrationStart;

    private LocalDateTime registrationEnd;

    private LocalDateTime competitionStart;

    private String status;

    private Long createdBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
