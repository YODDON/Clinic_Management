package com.dentalpro.module.portal.dto;

import java.util.List;

public record PublicAvailableDatesDto(String dentistId, List<String> dates) {
}
