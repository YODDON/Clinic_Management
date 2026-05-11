package com.dentalpro.module.treatmentrecord.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateTreatmentRecordRequest(
    @NotBlank String patientId,
    @NotBlank String appointmentId,
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
