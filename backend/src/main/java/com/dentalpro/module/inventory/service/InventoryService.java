package com.dentalpro.module.inventory.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.inventory.dto.*;

import java.util.List;

public interface InventoryService {
    PageResponse<InventoryItemDto> getItems();
    List<InventoryItemDto> getLowStock();
    InventoryItemDto getItem(String id);
    InventoryItemDto create(CreateInventoryItemRequest request);
    InventoryItemDto update(String id, UpdateInventoryItemRequest request);
    void delete(String id);
    InventoryItemDto adjustStock(String id, AdjustStockRequest request);
    List<StockBatchDto> getBatches(String inventoryId);
    StockBatchDto createBatch(CreateStockBatchRequest request);
}

