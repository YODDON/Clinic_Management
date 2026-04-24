package com.dentalpro.module.inventory.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.inventory.dto.*;
import com.dentalpro.module.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ApiResponse<PageResponse<InventoryItemDto>> getItems() {
        return ApiResponse.ok("Inventory fetched", inventoryService.getItems());
    }

    @GetMapping("/low-stock")
    public ApiResponse<List<InventoryItemDto>> getLowStock() {
        return ApiResponse.ok("Low stock fetched", inventoryService.getLowStock());
    }

    @GetMapping("/{id}")
    public ApiResponse<InventoryItemDto> getItem(@PathVariable String id) {
        return ApiResponse.ok("Inventory item fetched", inventoryService.getItem(id));
    }

    @PostMapping
    public ApiResponse<InventoryItemDto> create(@Valid @RequestBody CreateInventoryItemRequest request) {
        return ApiResponse.ok("Inventory item created", inventoryService.create(request));
    }

    @PatchMapping("/{id}")
    public ApiResponse<InventoryItemDto> update(@PathVariable String id, @Valid @RequestBody UpdateInventoryItemRequest request) {
        return ApiResponse.ok("Inventory item updated", inventoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        inventoryService.delete(id);
        return ApiResponse.ok("Inventory item deleted", null);
    }

    @PostMapping("/{id}/adjust-stock")
    public ApiResponse<InventoryItemDto> adjustStock(@PathVariable String id, @RequestBody AdjustStockRequest request) {
        return ApiResponse.ok("Stock adjusted", inventoryService.adjustStock(id, request));
    }

    @GetMapping("/{id}/batches")
    public ApiResponse<List<StockBatchDto>> getBatches(@PathVariable String id) {
        return ApiResponse.ok("Stock batches fetched", inventoryService.getBatches(id));
    }

    @PostMapping("/batches")
    public ApiResponse<StockBatchDto> createBatch(@Valid @RequestBody CreateStockBatchRequest request) {
        return ApiResponse.ok("Stock batch created", inventoryService.createBatch(request));
    }
}

