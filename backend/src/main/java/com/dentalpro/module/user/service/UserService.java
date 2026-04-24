package com.dentalpro.module.user.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.user.dto.UserDto;

public interface UserService {
    PageResponse<UserDto> getUsers();
}

