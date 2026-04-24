package com.dentalpro.module.patient.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.patient.dto.CreatePatientRequest;
import com.dentalpro.module.patient.dto.PatientDto;
import com.dentalpro.module.patient.dto.UpdatePatientRequest;
import com.dentalpro.module.patient.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public ApiResponse<PageResponse<PatientDto>> getPatients(@RequestParam(required = false) String search) {
        return ApiResponse.ok("Patients fetched", patientService.getPatients(search));
    }

    @GetMapping("/{id}")
    public ApiResponse<PatientDto> getPatient(@PathVariable String id) {
        return ApiResponse.ok("Patient fetched", patientService.getPatient(id));
    }

    @PostMapping
    public ApiResponse<PatientDto> create(@Valid @RequestBody CreatePatientRequest request) {
        return ApiResponse.ok("Patient created", patientService.create(request));
    }

    @PatchMapping("/{id}")
    public ApiResponse<PatientDto> update(@PathVariable String id, @Valid @RequestBody UpdatePatientRequest request) {
        return ApiResponse.ok("Patient updated", patientService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        patientService.delete(id);
        return ApiResponse.ok("Patient deleted", null);
    }

    @PostMapping("/{id}/activate")
    public ApiResponse<PatientDto> activate(@PathVariable String id) {
        return ApiResponse.ok("Patient activated", patientService.changeStatus(id, true));
    }

    @PostMapping("/{id}/deactivate")
    public ApiResponse<PatientDto> deactivate(@PathVariable String id) {
        return ApiResponse.ok("Patient deactivated", patientService.changeStatus(id, false));
    }

    @GetMapping("/export")
    public ResponseEntity<String> export() {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=patients.csv")
            .contentType(MediaType.TEXT_PLAIN)
            .body(patientService.exportCsv());
    }
}
