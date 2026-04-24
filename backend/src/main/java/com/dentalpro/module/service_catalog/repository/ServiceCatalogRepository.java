package com.dentalpro.module.service_catalog.repository;

import com.dentalpro.module.service_catalog.dto.CreateDentalChairRequest;
import com.dentalpro.module.service_catalog.dto.CreateDentalServiceRequest;
import com.dentalpro.module.service_catalog.dto.DentalChairDto;
import com.dentalpro.module.service_catalog.dto.DentalServiceDto;
import com.dentalpro.module.service_catalog.dto.UpdateDentalChairRequest;
import com.dentalpro.module.service_catalog.dto.UpdateDentalServiceRequest;

import java.util.List;

public interface ServiceCatalogRepository {
    List<DentalServiceDto> findAllServices();
    List<DentalServiceDto> findServiceById(String id);
    void insertService(String id, CreateDentalServiceRequest request);
    void updateService(String id, UpdateDentalServiceRequest request);
    void activateService(String id);
    void deleteService(String id);
    int countServiceReferences(String id);
    List<DentalChairDto> findAllChairs();
    List<DentalChairDto> findChairById(String id);
    void insertChair(String id, CreateDentalChairRequest request);
    void updateChair(String id, UpdateDentalChairRequest request);
    void deleteChair(String id);
    int countChairReferences(String id);
}
