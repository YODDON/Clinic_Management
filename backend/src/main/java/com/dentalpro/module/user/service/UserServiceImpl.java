package com.dentalpro.module.user.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.user.dto.UserDto;
import com.dentalpro.module.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public PageResponse<UserDto> getUsers() {
        List<UserDto> items = userRepository.findAll();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }
}
