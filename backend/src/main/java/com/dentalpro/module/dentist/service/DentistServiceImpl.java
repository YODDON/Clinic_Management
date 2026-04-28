package com.dentalpro.module.dentist.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.dentist.dto.CreateDentistRequest;
import com.dentalpro.module.dentist.dto.DentistDto;
import com.dentalpro.module.dentist.dto.UpdateDentistRequest;
import com.dentalpro.module.dentist.repository.DentistRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DentistServiceImpl implements DentistService {
    private final DentistRepository dentistRepository;
    private final PasswordEncoder passwordEncoder;

    public DentistServiceImpl(DentistRepository dentistRepository, PasswordEncoder passwordEncoder) {
        this.dentistRepository = dentistRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public PageResponse<DentistDto> getDentists() {
        List<DentistDto> items = dentistRepository.findAll();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public DentistDto getDentist(String id) {
        List<DentistDto> items = dentistRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Dentist not found");
        }
        return items.get(0);
    }

    @Override
    public DentistDto create(CreateDentistRequest request) {
        String id = UUID.randomUUID().toString();
        String employeeCode = request.employeeCode() == null || request.employeeCode().isBlank()
            ? "DEN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase()
            : request.employeeCode().trim();
        CreateDentistRequest resolvedRequest = new CreateDentistRequest(
            employeeCode,
            request.name(),
            request.email(),
            request.password(),
            request.phone(),
            request.dob(),
            request.workplace(),
            request.degree(),
            request.specialization(),
            request.licenseNumber(),
            request.yearsExperience(),
            request.consultationFee(),
            request.bio()
        );
        dentistRepository.insertUser(id, resolvedRequest, passwordEncoder.encode(request.password()));
        dentistRepository.insertDentist(id, resolvedRequest);
        return getDentist(id);
    }

    @Override
    public DentistDto update(String id, UpdateDentistRequest request) {
        dentistRepository.update(
            id,
            request,
            request.password() == null || request.password().isBlank() ? null : passwordEncoder.encode(request.password())
        );
        return getDentist(id);
    }

    @Override
    public DentistDto changeStatus(String id, boolean active) {
        dentistRepository.updateStatus(id, active);
        return getDentist(id);
    }

    @Override
    public void delete(String id) {
        getDentist(id);
        if (dentistRepository.countReferences(id) > 0) {
            throw new BadRequestException("Dentist is referenced by existing appointments, shifts, or treatment records");
        }
        dentistRepository.delete(id);
    }
}
