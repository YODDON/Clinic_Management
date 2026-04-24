package com.dentalpro.module.service_catalog.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateDentalChairRequest(@NotBlank String chairNumber, String chairName, String room) {
}

