package com.dentalpro.module.service_catalog.repository;

import com.dentalpro.module.service_catalog.dto.CreateDentalChairRequest;
import com.dentalpro.module.service_catalog.dto.CreateDentalServiceRequest;
import com.dentalpro.module.service_catalog.dto.DentalChairDto;
import com.dentalpro.module.service_catalog.dto.DentalServiceDto;
import com.dentalpro.module.service_catalog.dto.UpdateDentalChairRequest;
import com.dentalpro.module.service_catalog.dto.UpdateDentalServiceRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class ServiceCatalogRepositoryImpl implements ServiceCatalogRepository {
    private final JdbcTemplate jdbcTemplate;

    public ServiceCatalogRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<DentalServiceDto> findAllServices() {
        return jdbcTemplate.query("SELECT * FROM dental_services ORDER BY created_at DESC", this::mapService);
    }

    @Override
    public List<DentalServiceDto> findServiceById(String id) {
        return jdbcTemplate.query("SELECT * FROM dental_services WHERE id = ?", this::mapService, id);
    }

    @Override
    public void insertService(String id, CreateDentalServiceRequest request) {
        jdbcTemplate.update("""
            INSERT INTO dental_services (id, code, name, category, price, duration_minutes, description, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, true)
            """, id, request.code(), request.name(), request.category(), request.price() == null ? 0 : request.price(),
            request.durationMinutes() == null ? 30 : request.durationMinutes(), request.description());
    }

    @Override
    public void updateService(String id, UpdateDentalServiceRequest request) {
        jdbcTemplate.update("""
            UPDATE dental_services
            SET code = COALESCE(?, code),
                name = COALESCE(?, name),
                category = COALESCE(?, category),
                price = COALESCE(?, price),
                duration_minutes = COALESCE(?, duration_minutes),
                description = COALESCE(?, description),
                is_active = COALESCE(?, is_active)
            WHERE id = ?
            """, request.code(), request.name(), request.category(), request.price(), request.durationMinutes(), request.description(), request.active(), id);
    }

    @Override
    public void activateService(String id) {
        jdbcTemplate.update("UPDATE dental_services SET is_active = true WHERE id = ?", id);
    }

    @Override
    public void deleteService(String id) {
        jdbcTemplate.update("DELETE FROM dental_services WHERE id = ?", id);
    }

    @Override
    public int countServiceReferences(String id) {
        Integer value = jdbcTemplate.queryForObject("""
            SELECT
                (SELECT COUNT(*) FROM appointments WHERE service_id = ?) +
                (SELECT COUNT(*) FROM invoice_items WHERE service_id = ?) AS total_refs
            """, Integer.class, id, id);
        return value == null ? 0 : value;
    }

    @Override
    public List<DentalChairDto> findAllChairs() {
        return jdbcTemplate.query("SELECT * FROM dental_chairs ORDER BY chair_number", this::mapChair);
    }

    @Override
    public List<DentalChairDto> findChairById(String id) {
        return jdbcTemplate.query("SELECT * FROM dental_chairs WHERE id = ?", this::mapChair, id);
    }

    @Override
    public void insertChair(String id, CreateDentalChairRequest request) {
        jdbcTemplate.update("""
            INSERT INTO dental_chairs (id, chair_number, chair_name, room, is_active)
            VALUES (?, ?, ?, ?, true)
            """, id, request.chairNumber(), request.chairName(), request.room());
    }

    @Override
    public void updateChair(String id, UpdateDentalChairRequest request) {
        jdbcTemplate.update("""
            UPDATE dental_chairs
            SET chair_number = COALESCE(?, chair_number),
                chair_name = COALESCE(?, chair_name),
                room = COALESCE(?, room),
                is_active = COALESCE(?, is_active)
            WHERE id = ?
            """, request.chairNumber(), request.chairName(), request.room(), request.active(), id);
    }

    @Override
    public void deleteChair(String id) {
        jdbcTemplate.update("DELETE FROM dental_chairs WHERE id = ?", id);
    }

    @Override
    public int countChairReferences(String id) {
        Integer value = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM appointments WHERE chair_id = ?", Integer.class, id);
        return value == null ? 0 : value;
    }

    private DentalServiceDto mapService(ResultSet rs, int rowNum) throws SQLException {
        return new DentalServiceDto(
            rs.getString("id"),
            rs.getString("code"),
            rs.getString("name"),
            rs.getString("category"),
            rs.getDouble("price"),
            rs.getInt("duration_minutes"),
            rs.getString("description"),
            rs.getBoolean("is_active")
        );
    }

    private DentalChairDto mapChair(ResultSet rs, int rowNum) throws SQLException {
        return new DentalChairDto(
            rs.getString("id"),
            rs.getString("chair_number"),
            rs.getString("chair_name"),
            rs.getString("room"),
            rs.getBoolean("is_active")
        );
    }
}
