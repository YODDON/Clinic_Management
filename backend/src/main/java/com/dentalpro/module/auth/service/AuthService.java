package com.dentalpro.module.auth.service;

import com.dentalpro.module.auth.dto.AuthUserDto;
import com.dentalpro.module.auth.dto.ChangePasswordRequest;
import com.dentalpro.module.auth.dto.ForgotPasswordRequest;
import com.dentalpro.module.auth.dto.LoginRequest;
import com.dentalpro.module.auth.dto.LoginResponse;
import com.dentalpro.module.auth.dto.RegisterRequest;

public interface AuthService {
    LoginResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    AuthUserDto me(String email);
    void logout(String email);
    void forgotPassword(ForgotPasswordRequest request);
    void changePassword(String email, ChangePasswordRequest request);
}

