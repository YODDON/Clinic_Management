package com.dentalpro.module.treatmentrecord.dto;

public record TreatmentMaterialDto(
    String id,
    String treatmentRecordId,
    String inventoryId,
    String inventoryName,
    int quantity,
    String usageNote
) {
}

