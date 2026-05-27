package com.malahot.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @Size(min = 1, max = 50, message = "昵称长度1-50个字符")
    private String nickname;

    private String avatar;
}
