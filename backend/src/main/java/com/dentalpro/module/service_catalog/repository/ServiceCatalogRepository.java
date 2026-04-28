package com.dentalpro.module.service_catalog.repository;

import com.dentalpro.module.service_catalog.dto.CreateDentalChairRequest;
import com.dentalpro.module.service_catalog.dto.CreateDentalServiceRequest;
import com.dentalpro.module.service_catalog.dto.DentalChairDto;
import com.dentalpro.module.service_catalog.dto.DentalServiceDto;
import com.dentalpro.module.service_catalog.dto.ServicePriceHistoryDto;
import com.dentalpro.module.service_catalog.dto.UpdateDentalChairRequest;
import com.dentalpro.module.service_catalog.dto.UpdateDentalServiceRequest;

import java.util.List;

public interface ServiceCatalogRepository {
    List<DentalServiceDto> findAllServices();
    List<DentalServiceDto> findServiceById(String id);
    void insertService(String id, CreateDentalServiceRequest request);
    void updateService(String id, UpdateDentalServiceRequest request);
    void updateServicePrice(String id, double price);
    void insertPriceHistory(String id, String serviceId, double oldPrice, double newPrice, String changedBy, String changeNote);
    List<ServicePriceHistoryDto> findPriceHistory(String serviceId);
    void activateService(String id);
    void deactivateService(String id);
    void deleteService(String id);
    int countServiceReferences(String id);
    List<DentalChairDto> findAllChairs();
    List<DentalChairDto> findChairById(String id);
    void insertChair(String id, CreateDentalChairRequest request);
    void updateChair(String id, UpdateDentalChairRequest request);
    void deleteChair(String id);
    int countChairReferences(String id);
}
