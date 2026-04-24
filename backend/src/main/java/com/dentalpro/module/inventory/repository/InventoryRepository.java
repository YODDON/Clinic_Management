package com.dentalpro.module.inventory.repository;

import com.dentalpro.module.inventory.dto.CreateInventoryItemRequest;
import com.dentalpro.module.inventory.dto.CreateStockBatchRequest;
import com.dentalpro.module.inventory.dto.InventoryItemDto;
import com.dentalpro.module.inventory.dto.StockBatchDto;
import com.dentalpro.module.inventory.dto.UpdateInventoryItemRequest;

import java.util.List;

public interface InventoryRepository {
    List<InventoryItemDto> findAll();
    List<InventoryItemDto> findLowStock();
    List<InventoryItemDto> findById(String id);
    Integer findStockById(String id);
    void insert(String id, CreateInventoryItemRequest request, int stock, int minStock, double price);
    void update(String id, UpdateInventoryItemRequest request);
    void updateStock(String id, int stock);
    void incrementStock(String id, int quantity);
    void decrementStock(String id, int quantity);
    void delete(String id);
    List<StockBatchDto> findBatchesByInventoryId(String inventoryId);
    void insertBatch(String id, CreateStockBatchRequest request);
    StockBatchDto findBatchById(String id);
}
