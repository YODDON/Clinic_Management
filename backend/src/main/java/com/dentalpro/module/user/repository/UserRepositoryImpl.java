package com.dentalpro.module.user.repository;

import com.dentalpro.module.user.dto.UserDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@Repository
public class UserRepositoryImpl implements UserRepository {
    private final JdbcTemplate jdbcTemplate;

    public UserRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<UserDto> findAll() {
        return jdbcTemplate.query(
            "SELECT id, name, email, role, phone, is_active FROM users ORDER BY created_at DESC",
            this::mapRow
        );
    }

    @Override
    public List<Map<String, Object>> findAccountRowsByEmail(String email, boolean onlyActive) {
        String sql = """
            SELECT id, email, name, role, phone, avatar_url, password_hash, is_active
            FROM users
            WHERE email = ?
            """ + (onlyActive ? " AND is_active = true" : "");
        return jdbcTemplate.queryForList(sql, email);
    }

    @Override
    public boolean emailExists(String email) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE email = ?", Integer.class, email);
        return count != null && count > 0;
    }

    @Override
    public void insertUser(String id, String email, String name, String role, String passwordHash, String phone) {
        jdbcTemplate.update("""
            INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
            VALUES (?, ?, ?, ?, ?, ?, true)
            """, id, email, name, role, passwordHash, phone);
    }

    @Override
    public void insertCustomerPatient(String patientId, String userId, String name, String email, String phone) {
        jdbcTemplate.update("""
            INSERT INTO patients (id, user_id, name, email, phone, is_active)
            VALUES (?, ?, ?, ?, ?, true)
            """, patientId, userId, name, email, phone);
    }

    @Override
    public void updatePassword(String email, String passwordHash) {
        jdbcTemplate.update("UPDATE users SET password_hash = ? WHERE email = ?", passwordHash, email);
    }

    private UserDto mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new UserDto(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("role"),
            rs.getString("phone"),
            rs.getBoolean("is_active")
        );
    }
}
