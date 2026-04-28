package com.dentalpro.module.service_catalog.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.service_catalog.dto.*;

import java.util.List;

public interface ServiceCatalogService {
    PageResponse<DentalServiceDto> getServices();
    DentalServiceDto create(CreateDentalServiceRequest request);
    DentalServiceDto update(String id, UpdateDentalServiceRequest request);
    DentalServiceDto updatePrice(String id, UpdateServicePriceRequest request, String changedBy);
    List<ServicePriceHistoryDto> getPriceHistory(String id);
    DentalServiceDto activate(String id);
    DentalServiceDto deactivate(String id);
    void delete(String id);
    List<DentalChairDto> getChairs();
    DentalChairDto createChair(CreateDentalChairRequest request);
    DentalChairDto updateChair(String id, UpdateDentalChairRequest request);
    void deleteChair(String id);
    DentalServiceDto getService(String id);
    DentalChairDto getChair(String id);
}
