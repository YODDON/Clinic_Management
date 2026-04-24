package com.dentalpro.module.treatmentrecord.dto;

public record TreatmentRecordDto(
    String id,
    String patientId,
    String patientName,
    String appointmentId,
    String dentistId,
    String dentistName,
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

