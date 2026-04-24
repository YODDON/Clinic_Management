package com.dentalpro.module.inventory.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.inventory.dto.*;
import com.dentalpro.module.inventory.repository.InventoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class InventoryServiceImpl implements InventoryService {
    private final InventoryRepository inventoryRepository;

    public InventoryServiceImpl(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    public PageResponse<InventoryItemDto> getItems() {
        List<InventoryItemDto> items = inventoryRepository.findAll();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public List<InventoryItemDto> getLowStock() {
        return inventoryRepository.findLowStock();
    }

    @Override
    public InventoryItemDto getItem(String id) {
        List<InventoryItemDto> items = inventoryRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Inventory item not found");
        }
        return items.get(0);
    }

    @Override
    public InventoryItemDto create(CreateInventoryItemRequest request) {
        String id = UUID.randomUUID().toString();
        int stock = request.stock() == null ? 0 : request.stock();
        int minStock = request.minStock() == null ? 10 : request.minStock();
        double price = request.price() == null ? 0 : request.price();
        if (stock < 0 || minStock < 0 || price < 0) {
            throw new BadRequestException("Inventory values cannot be negative");
        }
        inventoryRepository.insert(id, request, stock, minStock, price);
        return getItem(id);
    }

    @Override
    public InventoryItemDto update(String id, UpdateInventoryItemRequest request) {
        inventoryRepository.update(id, request);
        return getItem(id);
    }

    @Override
    public void delete(String id) {
        inventoryRepository.delete(id);
    }

    @Override
    public InventoryItemDto adjustStock(String id, AdjustStockRequest request) {
        InventoryItemDto current = getItem(id);
        int nextStock = current.stock() + request.quantityDelta();
        if (nextStock < 0) {
            throw new BadRequestException("Stock cannot be reduced below 0");
        }
        inventoryRepository.updateStock(id, nextStock);
        return getItem(id);
    }

    @Override
    public List<StockBatchDto> getBatches(String inventoryId) {
        return inventoryRepository.findBatchesByInventoryId(inventoryId);
    }

    @Override
    public StockBatchDto createBatch(CreateStockBatchRequest request) {
        if (request.quantity() <= 0) {
            throw new BadRequestException("Batch quantity must be greater than 0");
        }
        String id = UUID.randomUUID().toString();
        inventoryRepository.insertBatch(id, request);
        inventoryRepository.incrementStock(request.inventoryId(), request.quantity());
        return inventoryRepository.findBatchById(id);
    }
}
