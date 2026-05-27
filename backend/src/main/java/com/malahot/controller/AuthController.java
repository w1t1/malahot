package com.malahot.controller;

import com.malahot.dto.request.LoginRequest;
import com.malahot.dto.request.SendCodeRequest;
import com.malahot.dto.request.UpdateUserRequest;
import com.malahot.dto.response.LoginResponse;
import com.malahot.dto.response.Result;
import com.malahot.entity.User;
import com.malahot.security.SecurityUtil;
import com.malahot.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "认证模块")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "发送验证码")
    @PostMapping("/send-code")
    public Result<Void> sendCode(@Valid @RequestBody SendCodeRequest request,
                                  HttpServletRequest httpRequest) {
        authService.sendCode(request, httpRequest.getRemoteAddr());
        return Result.success();
    }

    @Operation(summary = "手机号验证码登录")
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(authService.login(request));
    }

    @Operation(summary = "获取当前用户信息")
    @GetMapping("/me")
    public Result<User> getCurrentUser() {
        return Result.success(authService.getCurrentUser(SecurityUtil.getCurrentUserId()));
    }

    @Operation(summary = "更新用户信息")
    @PutMapping("/me")
    public Result<Void> updateUser(@Valid @RequestBody UpdateUserRequest request) {
        authService.updateUser(SecurityUtil.getCurrentUserId(), request);
        return Result.success();
    }
}
