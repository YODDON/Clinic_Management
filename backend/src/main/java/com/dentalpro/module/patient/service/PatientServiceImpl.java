package com.dentalpro.module.patient.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.patient.dto.CreatePatientRequest;
import com.dentalpro.module.patient.dto.PatientDto;
import com.dentalpro.module.patient.dto.UpdatePatientRequest;
import com.dentalpro.module.patient.repository.PatientRepository;
import com.dentalpro.module.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PatientServiceImpl implements PatientService {
    private static final String DEFAULT_CUSTOMER_PASSWORD = "Customer@123";

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PatientServiceImpl(PatientRepository patientRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public PageResponse<PatientDto> getPatients(String email, String search) {
        Map<String, Object> account = resolveAccount(email);
        String role = String.valueOf(account.get("role"));
        String userId = String.valueOf(account.get("id"));

        List<PatientDto> items = "dentist".equals(role)
            ? patientRepository.findAllForDentist(userId, search)
            : patientRepository.findAll(search);
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public PatientDto getPatient(String email, String id) {
        Map<String, Object> account = resolveAccount(email);
        String role = String.valueOf(account.get("role"));
        String userId = String.valueOf(account.get("id"));

        List<PatientDto> items = "dentist".equals(role)
            ? patientRepository.findByIdForDentist(id, userId)
            : patientRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Patient not found");
        }
        return items.get(0);
    }

    @Override
    @Transactional
    public PatientDto create(CreatePatientRequest request) {
        if (userRepository.emailExists(request.email())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        String patientId = UUID.randomUUID().toString();
        String userId = UUID.randomUUID().toString();
        String password = request.password() == null || request.password().isBlank()
            ? DEFAULT_CUSTOMER_PASSWORD
            : request.password();

        userRepository.insertUser(
            userId,
            request.email(),
            request.name(),
            "customer",
            passwordEncoder.encode(password),
            request.phone()
        );
        patientRepository.insert(patientId, userId, request);
        return findPatient(patientId);
    }

    @Override
    @Transactional
    public PatientDto update(String id, UpdatePatientRequest request) {
        String userId = patientRepository.findUserIdById(id);
        if (userRepository.emailExistsForOther(request.email(), userId)) {
            throw new BadRequestException("Email đã tồn tại");
        }

        userRepository.updateUser(
            userId,
            request.email(),
            request.name(),
            "customer",
            null,
            request.phone(),
            request.active()
        );
        patientRepository.update(id, request);
        return findPatient(id);
    }

    @Override
    @Transactional
    public PatientDto changeStatus(String id, boolean active) {
        String userId = patientRepository.findUserIdById(id);
        userRepository.updateStatus(userId, active);
        patientRepository.updateStatus(id, active);
        return findPatient(id);
    }

    @Override
    @Transactional
    public void delete(String id) {
        findPatient(id);
        if (patientRepository.countReferences(id) > 0) {
            throw new BadRequestException("Patient is referenced by existing appointments, treatment records, or invoices");
        }
        String userId = patientRepository.findUserIdById(id);
        patientRepository.delete(id);
        userRepository.deleteUser(userId);
    }

    @Override
    public String exportCsv(String email) {
        List<PatientDto> items = getPatients(email, null).content();
        StringBuilder builder = new StringBuilder("id,name,email,phone,gender,active\n");
        for (PatientDto item : items) {
            builder.append(item.id()).append(",")
                .append(item.name()).append(",")
                .append(item.email()).append(",")
                .append(item.phone()).append(",")
                .append(item.gender()).append(",")
                .append(item.active()).append("\n");
        }
        return builder.toString();
    }

    private PatientDto findPatient(String id) {
        List<PatientDto> items = patientRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Patient not found");
        }
        return items.get(0);
    }

    private Map<String, Object> resolveAccount(String email) {
        List<Map<String, Object>> rows = userRepository.findAccountRowsByEmail(email, false);
        if (rows.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy tài khoản");
        }
        return rows.get(0);
    }
}
