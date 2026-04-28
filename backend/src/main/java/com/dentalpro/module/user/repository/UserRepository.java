package com.dentalpro.module.user.repository;

import com.dentalpro.module.user.dto.UserDto;

import java.util.List;
import java.util.Map;

public interface UserRepository {
    List<UserDto> findAll();
    List<UserDto> findManagedStaff();
    List<UserDto> findById(String id);
    List<Map<String, Object>> findAccountRowsByEmail(String email, boolean onlyActive);
    boolean emailExists(String email);
    boolean emailExistsForOther(String email, String id);
    void insertUser(String id, String email, String name, String role, String passwordHash, String phone);
    void updateUser(String id, String email, String name, String role, String passwordHash, String phone, Boolean active);
    void updateStatus(String id, boolean active);
    void deleteUser(String id);
    void insertCustomerPatient(String patientId, String userId, String name, String email, String phone);
    void updatePassword(String email, String passwordHash);
}
