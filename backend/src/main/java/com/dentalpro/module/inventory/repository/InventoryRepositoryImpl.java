package com.dentalpro.module.inventory.repository;

import com.dentalpro.module.inventory.dto.CreateInventoryItemRequest;
import com.dentalpro.module.inventory.dto.CreateStockBatchRequest;
import com.dentalpro.module.inventory.dto.InventoryItemDto;
import com.dentalpro.module.inventory.dto.StockBatchDto;
import com.dentalpro.module.inventory.dto.UpdateInventoryItemRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class InventoryRepositoryImpl implements InventoryRepository {
    private final JdbcTemplate jdbcTemplate;

    public InventoryRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<InventoryItemDto> findAll() {
        return jdbcTemplate.query("SELECT * FROM inventory ORDER BY created_at DESC", this::mapItem);
    }

    @Override
    public List<InventoryItemDto> findLowStock() {
        return jdbcTemplate.query("SELECT * FROM inventory WHERE stock <= min_stock ORDER BY stock ASC", this::mapItem);
    }

    @Override
    public List<InventoryItemDto> findById(String id) {
        return jdbcTemplate.query("SELECT * FROM inventory WHERE id = ?", this::mapItem, id);
    }

    @Override
    public Integer findStockById(String id) {
        return jdbcTemplate.queryForObject("SELECT stock FROM inventory WHERE id = ?", Integer.class, id);
    }

    @Override
    public void insert(String id, CreateInventoryItemRequest request, int stock, int minStock, double price) {
        jdbcTemplate.update("""
            INSERT INTO inventory (id, code, name, category, unit, stock, min_stock, price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, id, request.code(), request.name(), request.category(), request.unit(), stock, minStock, price);
    }

    @Override
    public void update(String id, UpdateInventoryItemRequest request) {
        jdbcTemplate.update("""
            UPDATE inventory
            SET code = COALESCE(?, code),
                name = COALESCE(?, name),
                category = COALESCE(?, category),
                unit = COALESCE(?, unit),
                stock = COALESCE(?, stock),
                min_stock = COALESCE(?, min_stock),
                price = COALESCE(?, price)
            WHERE id = ?
            """, request.code(), request.name(), request.category(), request.unit(), request.stock(), request.minStock(), request.price(), id);
    }

    @Override
    public void updateStock(String id, int stock) {
        jdbcTemplate.update("UPDATE inventory SET stock = ? WHERE id = ?", stock, id);
    }

    @Override
    public void incrementStock(String id, int quantity) {
        jdbcTemplate.update("UPDATE inventory SET stock = stock + ? WHERE id = ?", quantity, id);
    }

    @Override
    public void decrementStock(String id, int quantity) {
        jdbcTemplate.update("UPDATE inventory SET stock = stock - ? WHERE id = ?", quantity, id);
    }

    @Override
    public void delete(String id) {
        jdbcTemplate.update("DELETE FROM inventory WHERE id = ?", id);
    }

    @Override
    public List<StockBatchDto> findBatchesByInventoryId(String inventoryId) {
        return jdbcTemplate.query(
            "SELECT * FROM stock_batches WHERE inventory_id = ? ORDER BY import_date DESC",
            this::mapBatch,
            inventoryId
        );
    }

    @Override
    public void insertBatch(String id, CreateStockBatchRequest request) {
        jdbcTemplate.update("""
            INSERT INTO stock_batches (id, inventory_id, batch_number, quantity, expiry_date, supplier)
            VALUES (?, ?, ?, ?, ?, ?)
            """, id, request.inventoryId(), request.batchNumber(), request.quantity(), request.expiryDate(), request.supplier());
    }

    @Override
    public StockBatchDto findBatchById(String id) {
        return jdbcTemplate.queryForObject("SELECT * FROM stock_batches WHERE id = ?", this::mapBatch, id);
    }

    private InventoryItemDto mapItem(ResultSet rs, int rowNum) throws SQLException {
        return new InventoryItemDto(
            rs.getString("id"),
            rs.getString("code"),
            rs.getString("name"),
            rs.getString("category"),
            rs.getString("unit"),
            rs.getInt("stock"),
            rs.getInt("min_stock"),
            rs.getDouble("price")
        );
    }

    private StockBatchDto mapBatch(ResultSet rs, int rowNum) throws SQLException {
        return new StockBatchDto(
            rs.getString("id"),
            rs.getString("inventory_id"),
            rs.getString("batch_number"),
            rs.getInt("quantity"),
            rs.getString("expiry_date"),
            rs.getString("supplier"),
            rs.getString("import_date")
        );
    }
}
