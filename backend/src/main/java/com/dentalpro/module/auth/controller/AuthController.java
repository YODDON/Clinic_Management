package com.dentalpro.module.auth.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.module.auth.dto.AuthUserDto;
import com.dentalpro.module.auth.dto.ChangePasswordRequest;
import com.dentalpro.module.auth.dto.ForgotPasswordRequest;
import com.dentalpro.module.auth.dto.LoginRequest;
import com.dentalpro.module.auth.dto.LoginResponse;
import com.dentalpro.module.auth.dto.RegisterRequest;
import com.dentalpro.module.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Đăng ký thành công", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Đăng nhập thành công", authService.login(request));
    }

    @GetMapping("/me")
    public ApiResponse<AuthUserDto> me(Authentication authentication) {
        return ApiResponse.ok("Lấy thông tin tài khoản thành công", authService.me(authentication.getName()));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(Authentication authentication) {
        authService.logout(authentication.getName());
        return ApiResponse.ok("Đăng xuất thành công", null);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.ok("Đã tiếp nhận yêu cầu đặt lại mật khẩu", null);
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(authentication.getName(), request);
        return ApiResponse.ok("Đổi mật khẩu thành công", null);
    }
}
