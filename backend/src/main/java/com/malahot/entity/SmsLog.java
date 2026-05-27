package com.malahot.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sms_log")
public class SmsLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String phone;

    private String code;

    private String type;

    private String ip;

    private LocalDateTime sentAt;

    private Integer used;
}
