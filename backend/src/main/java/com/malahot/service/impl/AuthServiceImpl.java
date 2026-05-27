package com.malahot.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.malahot.dto.request.LoginRequest;
import com.malahot.dto.request.SendCodeRequest;
import com.malahot.dto.request.UpdateUserRequest;
import com.malahot.dto.response.LoginResponse;
import com.malahot.entity.SmsLog;
import com.malahot.entity.User;
import com.malahot.enums.UserRole;
import com.malahot.mapper.SmsLogMapper;
import com.malahot.mapper.UserMapper;
import com.malahot.service.AuthService;
import com.malahot.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final SmsLogMapper smsLogMapper;
    private final StringRedisTemplate redisTemplate;
    private final JwtUtil jwtUtil;

    @Value("${sms.mock-enabled:true}")
    private boolean smsMockEnabled;

    @Value("${sms.mock-code:8888}")
    private String smsMockCode;

    private static final String SMS_CODE_PREFIX = "sms:code:";
    private static final long SMS_CODE_EXPIRE_MINUTES = 5;
    private static final long SMS_SEND_INTERVAL_SECONDS = 60;

    @Override
    public void sendCode(SendCodeRequest request, String ip) {
        String phone = request.getPhone();

        // Rate limiting: 1 SMS per 60 seconds per phone
        String intervalKey = "sms:interval:" + phone;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(intervalKey))) {
            throw new RuntimeException("发送太频繁，请60秒后再试");
        }

        // Generate code
        String code;
        if (smsMockEnabled) {
            code = smsMockCode;
            log.info("Mock SMS code for {}: {}", phone, code);
        } else {
            code = String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
            // TODO: integrate Alibaba Cloud SMS SDK to send real SMS
            log.info("SMS code for {}: {}", phone, code);
        }

        // Store code in Redis with 5-minute TTL
        redisTemplate.opsForValue().set(SMS_CODE_PREFIX + phone, code, SMS_CODE_EXPIRE_MINUTES, TimeUnit.MINUTES);

        // Set rate limit
        redisTemplate.opsForValue().set(intervalKey, "1", SMS_SEND_INTERVAL_SECONDS, TimeUnit.SECONDS);

        // Log SMS
        SmsLog smsLog = new SmsLog();
        smsLog.setPhone(phone);
        smsLog.setCode(code);
        smsLog.setType("LOGIN");
        smsLog.setIp(ip);
        smsLog.setSentAt(LocalDateTime.now());
        smsLog.setUsed(0);
        smsLogMapper.insert(smsLog);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        String phone = request.getPhone();
        String code = request.getCode();

        // Verify code
        String cacheKey = SMS_CODE_PREFIX + phone;
        String cachedCode = redisTemplate.opsForValue().get(cacheKey);
        if (cachedCode == null || !cachedCode.equals(code)) {
            throw new RuntimeException("验证码错误或已过期");
        }
        // Delete used code
        redisTemplate.delete(cacheKey);

        // Find or create user
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getPhone, phone));

        if (user == null) {
            // Auto register
            user = new User();
            user.setPhone(phone);
            user.setNickname("选手" + phone.substring(7));
            user.setRole(UserRole.PLAYER.name());
            user.setStatus(1);
            userMapper.insert(user);
        }

        if (user.getStatus() == 0) {
            throw new RuntimeException("账号已被禁用");
        }

        // Generate JWT
        String token = jwtUtil.generateToken(user.getId(), user.getRole());

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .nickname(user.getNickname())
                .phone(user.getPhone())
                .role(user.getRole())
                .avatar(user.getAvatar())
                .build();
    }

    @Override
    public User getCurrentUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return user;
    }

    @Override
    public void updateUser(Long userId, UpdateUserRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if (StringUtils.hasText(request.getNickname())) {
            user.setNickname(request.getNickname());
        }
        if (StringUtils.hasText(request.getAvatar())) {
            user.setAvatar(request.getAvatar());
        }
        userMapper.updateById(user);
    }
}
