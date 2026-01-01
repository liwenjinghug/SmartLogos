package com.smartlogos.note.controller;

import com.smartlogos.note.dto.ApiResponse;
import com.smartlogos.note.dto.AuthResponse;
import com.smartlogos.note.dto.LoginRequest;
import com.smartlogos.note.dto.RegisterRequest;
import com.smartlogos.note.entity.User;
import com.smartlogos.note.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest request) {
        try {
            if (userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.ok(ApiResponse.error(400, "用户名已存在"));
            }
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.ok(ApiResponse.error(400, "邮箱已存在"));
            }

            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            User saved = userRepository.save(user);

            AuthResponse resp = new AuthResponse(saved.getId(), saved.getUsername(), saved.getEmail(), null);
            return ResponseEntity.ok(ApiResponse.success("success", resp));
        } catch (Exception e) {
            log.error("注册失败", e);
            return ResponseEntity.ok(ApiResponse.error(500, "注册失败: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        try {
            User user = userRepository.findByUsername(request.getUsername())
                    .or(() -> userRepository.findByEmail(request.getUsername()))
                    .orElse(null);
            if (user == null) {
                return ResponseEntity.ok(ApiResponse.error(401, "用户不存在"));
            }
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.ok(ApiResponse.error(401, "密码错误"));
            }
            AuthResponse resp = new AuthResponse(user.getId(), user.getUsername(), user.getEmail(), null);
            return ResponseEntity.ok(ApiResponse.success("success", resp));
        } catch (Exception e) {
            log.error("登录失败", e);
            return ResponseEntity.ok(ApiResponse.error(500, "登录失败: " + e.getMessage()));
        }
    }
}
