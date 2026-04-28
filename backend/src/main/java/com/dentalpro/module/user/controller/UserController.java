package com.dentalpro.module.user.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.user.dto.CreateUserRequest;
import com.dentalpro.module.user.dto.UpdateUserRequest;
import com.dentalpro.module.user.dto.UserDto;
import com.dentalpro.module.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ApiResponse<PageResponse<UserDto>> getUsers() {
        return ApiResponse.ok("Users fetched", userService.getUsers());
    }

    @GetMapping("/{id}")
    public ApiResponse<UserDto> getUser(@PathVariable String id) {
        return ApiResponse.ok("User fetched", userService.getUser(id));
    }

    @PostMapping
    public ApiResponse<UserDto> create(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.ok("User created", userService.create(request));
    }

    @PatchMapping("/{id}")
    public ApiResponse<UserDto> update(@PathVariable String id, @Valid @RequestBody UpdateUserRequest request) {
        return ApiResponse.ok("User updated", userService.update(id, request));
    }

    @PostMapping("/{id}/activate")
    public ApiResponse<UserDto> activate(@PathVariable String id) {
        return ApiResponse.ok("User activated", userService.changeStatus(id, true));
    }

    @PostMapping("/{id}/deactivate")
    public ApiResponse<UserDto> deactivate(@PathVariable String id) {
        return ApiResponse.ok("User deactivated", userService.changeStatus(id, false));
    }
}
