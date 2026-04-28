package com.dentalpro.module.user.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.user.dto.CreateUserRequest;
import com.dentalpro.module.user.dto.UpdateUserRequest;
import com.dentalpro.module.user.dto.UserDto;

public interface UserService {
    PageResponse<UserDto> getUsers();
    UserDto getUser(String id);
    UserDto create(CreateUserRequest request);
    UserDto update(String id, UpdateUserRequest request);
    UserDto changeStatus(String id, boolean active);
}

