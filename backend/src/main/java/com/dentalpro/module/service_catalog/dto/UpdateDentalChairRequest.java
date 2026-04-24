package com.dentalpro.module.service_catalog.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateDentalChairRequest(@NotBlank String chairNumber, String chairName, String room, Boolean active) {
}
