package com.dentalpro.security;

import com.dentalpro.module.user.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        List<Map<String, Object>> rows = userRepository.findAccountRowsByEmail(email, false);

        if (rows.isEmpty()) {
            throw new UsernameNotFoundException("User not found");
        }

        Map<String, Object> row = rows.get(0);
        boolean active = Boolean.TRUE.equals(row.get("is_active"));
        return User.withUsername((String) row.get("email"))
            .password((String) row.get("password_hash"))
            .disabled(!active)
            .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + ((String) row.get("role")).toUpperCase())))
            .build();
    }
}

