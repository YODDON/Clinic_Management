package com.dentalpro.module.service_catalog.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.service_catalog.dto.*;
import com.dentalpro.module.service_catalog.repository.ServiceCatalogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ServiceCatalogServiceImpl implements ServiceCatalogService {
    private final ServiceCatalogRepository serviceCatalogRepository;

    public ServiceCatalogServiceImpl(ServiceCatalogRepository serviceCatalogRepository) {
        this.serviceCatalogRepository = serviceCatalogRepository;
    }

    @Override
    public PageResponse<DentalServiceDto> getServices() {
        List<DentalServiceDto> items = serviceCatalogRepository.findAllServices();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public DentalServiceDto create(CreateDentalServiceRequest request) {
        String id = UUID.randomUUID().toString();
        serviceCatalogRepository.insertService(id, request);
        return getService(id);
    }

    @Override
    public DentalServiceDto update(String id, UpdateDentalServiceRequest request) {
        serviceCatalogRepository.updateService(id, request);
        return getService(id);
    }

    @Override
    public DentalServiceDto updatePrice(String id, UpdateServicePriceRequest request, String changedBy) {
        DentalServiceDto current = getService(id);
        serviceCatalogRepository.updateServicePrice(id, request.price());
        serviceCatalogRepository.insertPriceHistory(
            UUID.randomUUID().toString(),
            id,
            current.price(),
            request.price(),
            changedBy,
            request.changeNote()
        );
        return getService(id);
    }

    @Override
    public List<ServicePriceHistoryDto> getPriceHistory(String id) {
        getService(id);
        return serviceCatalogRepository.findPriceHistory(id);
    }

    @Override
    public DentalServiceDto activate(String id) {
        serviceCatalogRepository.activateService(id);
        return getService(id);
    }

    @Override
    public DentalServiceDto deactivate(String id) {
        serviceCatalogRepository.deactivateService(id);
        return getService(id);
    }

    @Override
    public void delete(String id) {
        getService(id);
        if (serviceCatalogRepository.countServiceReferences(id) > 0) {
            throw new BadRequestException("Service is referenced by existing appointments or invoices");
        }
        serviceCatalogRepository.deleteService(id);
    }

    @Override
    public List<DentalChairDto> getChairs() {
        return serviceCatalogRepository.findAllChairs();
    }

    @Override
    public DentalChairDto createChair(CreateDentalChairRequest request) {
        String id = UUID.randomUUID().toString();
        serviceCatalogRepository.insertChair(id, request);
        return getChair(id);
    }

    @Override
    public DentalChairDto updateChair(String id, UpdateDentalChairRequest request) {
        serviceCatalogRepository.updateChair(id, request);
        return getChair(id);
    }

    @Override
    public void deleteChair(String id) {
        getChair(id);
        if (serviceCatalogRepository.countChairReferences(id) > 0) {
            throw new BadRequestException("Chair is referenced by existing appointments");
        }
        serviceCatalogRepository.deleteChair(id);
    }

    @Override
    public DentalServiceDto getService(String id) {
        List<DentalServiceDto> items = serviceCatalogRepository.findServiceById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Service not found");
        }
        return items.get(0);
    }

    @Override
    public DentalChairDto getChair(String id) {
        List<DentalChairDto> items = serviceCatalogRepository.findChairById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Chair not found");
        }
        return items.get(0);
    }
}
