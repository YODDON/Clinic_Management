package com.dentalpro.module.user.repository;

import com.dentalpro.module.user.dto.UserDto;

import java.util.List;
import java.util.Map;

public interface UserRepository {
    List<UserDto> findAll();
    List<Map<String, Object>> findAccountRowsByEmail(String email, boolean onlyActive);
    boolean emailExists(String email);
    void insertUser(String id, String email, String name, String role, String passwordHash, String phone);
    void insertCustomerPatient(String patientId, String userId, String name, String email, String phone);
    void updatePassword(String email, String passwordHash);
}
