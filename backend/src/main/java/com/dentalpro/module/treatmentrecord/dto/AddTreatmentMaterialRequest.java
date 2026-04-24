package com.dentalpro.module.treatmentrecord.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record AddTreatmentMaterialRequest(@NotBlank String inventoryId, @Min(1) int quantity, String usageNote) {
}

