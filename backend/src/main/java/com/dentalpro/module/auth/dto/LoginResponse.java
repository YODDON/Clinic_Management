package com.dentalpro.module.auth.dto;

public record LoginResponse(String token, String accessToken, String tokenType, long expiresIn, AuthUserDto user) {
}

