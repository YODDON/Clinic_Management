package com.dentalpro.module.treatmentrecord.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateTreatmentRecordRequest(
    @NotBlank String patientId,
    String appointmentId,
    @NotBlank String dentistId,
    String visitDate,
    String chiefComplaint,
    String diagnosis,
    String treatmentPlan,
    String treatmentDone,
    String toothChart,
    String nextVisitNote,
    String notes
) {
}

