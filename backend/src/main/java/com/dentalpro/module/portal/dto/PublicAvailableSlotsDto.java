package com.dentalpro.module.portal.dto;

import java.util.List;

public record PublicAvailableSlotsDto(String dentistId, String date, List<String> slots) {
}
