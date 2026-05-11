package com.dentalpro.module.user.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.user.dto.CreateUserRequest;
import com.dentalpro.module.user.dto.UpdateUserRequest;
import com.dentalpro.module.user.dto.UserDto;
import com.dentalpro.module.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Set<String> MANAGED_ROLES = Set.of("admin");

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public PageResponse<UserDto> getUsers() {
        List<UserDto> items = userRepository.findManagedStaff();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public UserDto getUser(String id) {
        List<UserDto> items = userRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy tài khoản");
        }
        return items.get(0);
    }

    @Override
    public UserDto create(CreateUserRequest request) {
        validateManagedRole(request.role());
        if (userRepository.emailExists(request.email())) {
            throw new BadRequestException("Email đã tồn tại");
        }
        String id = UUID.randomUUID().toString();
        userRepository.insertUser(
            id,
            request.email(),
            request.name(),
            request.role().trim().toLowerCase(),
            passwordEncoder.encode(request.password()),
            request.phone()
        );
        return getUser(id);
    }

    @Override
    public UserDto update(String id, UpdateUserRequest request) {
        getUser(id);
        validateManagedRole(request.role());
        if (userRepository.emailExistsForOther(request.email(), id)) {
            throw new BadRequestException("Email đã tồn tại");
        }
        userRepository.updateUser(
            id,
            request.email(),
            request.name(),
            request.role().trim().toLowerCase(),
            request.password() == null || request.password().isBlank() ? null : passwordEncoder.encode(request.password()),
            request.phone(),
            request.active()
        );
        return getUser(id);
    }

    @Override
    public UserDto changeStatus(String id, boolean active) {
        UserDto user = getUser(id);
        validateManagedRole(user.role());
        userRepository.updateStatus(id, active);
        return getUser(id);
    }

    private void validateManagedRole(String role) {
        String normalized = role == null ? "" : role.trim().toLowerCase();
        if (!MANAGED_ROLES.contains(normalized)) {
            throw new BadRequestException("Only admin accounts are managed in this module");
        }
    }
}
