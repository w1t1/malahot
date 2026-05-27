package com.malahot.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private Long userId;
    private String nickname;
    private String phone;
    private String role;
    private String avatar;
}
