package com.dentalpro.module.auth.service;

import com.dentalpro.config.JwtConfig;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.UnauthorizedException;
import com.dentalpro.module.auth.dto.AuthUserDto;
import com.dentalpro.module.auth.dto.ChangePasswordRequest;
import com.dentalpro.module.auth.dto.ForgotPasswordRequest;
import com.dentalpro.module.auth.dto.LoginRequest;
import com.dentalpro.module.auth.dto.LoginResponse;
import com.dentalpro.module.auth.dto.RegisterRequest;
import com.dentalpro.module.user.repository.UserRepository;
import com.dentalpro.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtConfig jwtConfig;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider, JwtConfig jwtConfig) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtConfig = jwtConfig;
    }

    @Override
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.emailExists(request.email())) {
            throw new BadRequestException("Email already exists");
        }

        String userId = UUID.randomUUID().toString();
        String patientId = UUID.randomUUID().toString();
        String passwordHash = passwordEncoder.encode(request.password());

        userRepository.insertUser(userId, request.email(), request.name(), "customer", passwordHash, request.phone());
        userRepository.insertCustomerPatient(patientId, userId, request.name(), request.email(), request.phone());

        String token = jwtTokenProvider.generateToken(request.email());
        Map<String, Object> user = loadUserByEmail(request.email());
        return new LoginResponse(token, token, "Bearer", jwtConfig.expirationMs() / 1000, toAuthUser(user));
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Map<String, Object> user = loadUserByEmail(request.email());

        if (!passwordEncoder.matches(request.password(), (String) user.get("password_hash"))) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String token = jwtTokenProvider.generateToken(request.email());
        return new LoginResponse(token, token, "Bearer", jwtConfig.expirationMs() / 1000, toAuthUser(user));
    }

    @Override
    public AuthUserDto me(String email) {
        return toAuthUser(loadUserByEmail(email));
    }

    @Override
    public void logout(String email) {
        loadUserByEmail(email);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        loadUserByEmail(request.email());
    }

    @Override
    public void changePassword(String email, ChangePasswordRequest request) {
        Map<String, Object> user = loadUserByEmail(email);
        if (!passwordEncoder.matches(request.currentPassword(), (String) user.get("password_hash"))) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("New password confirmation does not match");
        }

        userRepository.updatePassword(email, passwordEncoder.encode(request.newPassword()));
    }

    private Map<String, Object> loadUserByEmail(String email) {
        List<Map<String, Object>> rows = userRepository.findAccountRowsByEmail(email, true);
        if (rows.isEmpty()) {
            throw new UnauthorizedException("User not found");
        }
        return rows.get(0);
    }

    private AuthUserDto toAuthUser(Map<String, Object> row) {
        return new AuthUserDto(
            (String) row.get("id"),
            (String) row.get("name"),
            (String) row.get("email"),
            (String) row.get("role"),
            (String) row.get("phone"),
            (String) row.get("avatar_url")
        );
    }
}

