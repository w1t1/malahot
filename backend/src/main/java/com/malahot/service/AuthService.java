package com.malahot.service;

import com.malahot.dto.request.LoginRequest;
import com.malahot.dto.request.SendCodeRequest;
import com.malahot.dto.request.UpdateUserRequest;
import com.malahot.dto.response.LoginResponse;
import com.malahot.entity.User;

public interface AuthService {

    void sendCode(SendCodeRequest request, String ip);

    LoginResponse login(LoginRequest request);

    User getCurrentUser(Long userId);

    void updateUser(Long userId, UpdateUserRequest request);
}
