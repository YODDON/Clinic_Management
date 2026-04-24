package com.dentalpro.module.user.repository;

import com.dentalpro.module.user.dto.UserDto;

import java.util.List;
import java.util.Map;

public interface UserRepository {
    List<UserDto> findAll();
    List<Map<String, Object>> findAccountRowsByEmail(String email, boolean onlyActive);
    void updatePassword(String email, String passwordHash);
}
