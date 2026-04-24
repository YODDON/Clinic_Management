package com.dentalpro.config;

import com.dentalpro.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/login", "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/v1/dashboard/**").hasAnyRole("ADMIN", "DENTIST")
                .requestMatchers("/api/v1/patients/export").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/patients", "/api/v1/patients/*").hasAnyRole("ADMIN", "RECEPTIONIST", "DENTIST")
                .requestMatchers(HttpMethod.POST, "/api/v1/patients").hasAnyRole("ADMIN", "RECEPTIONIST")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/patients/*").hasAnyRole("ADMIN", "RECEPTIONIST")
                .requestMatchers(HttpMethod.POST, "/api/v1/patients/*/activate", "/api/v1/patients/*/deactivate").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/patients/*").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/v1/dentists", "/api/v1/dentists/*").hasAnyRole("ADMIN", "RECEPTIONIST", "DENTIST")
                .requestMatchers(HttpMethod.POST, "/api/v1/dentists").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/dentists/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/dentists/*/activate", "/api/v1/dentists/*/deactivate").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/dentists/*").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/v1/dentist-shifts", "/api/v1/dentist-shifts/*").hasAnyRole("ADMIN", "DENTIST")
                .requestMatchers(HttpMethod.POST, "/api/v1/dentist-shifts").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/dentist-shifts/*").hasAnyRole("ADMIN", "DENTIST")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/dentist-shifts/*").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/v1/appointments", "/api/v1/appointments/*").hasAnyRole("ADMIN", "RECEPTIONIST", "DENTIST")
                .requestMatchers(HttpMethod.POST, "/api/v1/appointments").hasAnyRole("ADMIN", "RECEPTIONIST")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/appointments/*").hasAnyRole("ADMIN", "RECEPTIONIST", "DENTIST")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/appointments/*").hasAnyRole("ADMIN", "RECEPTIONIST")

                .requestMatchers(HttpMethod.GET, "/api/v1/treatment-records", "/api/v1/treatment-records/*", "/api/v1/treatment-records/*/materials").hasAnyRole("ADMIN", "DENTIST")
                .requestMatchers(HttpMethod.POST, "/api/v1/treatment-records", "/api/v1/treatment-records/*/materials").hasAnyRole("ADMIN", "DENTIST")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/treatment-records/*").hasAnyRole("ADMIN", "DENTIST")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/treatment-records/*").hasAnyRole("ADMIN", "DENTIST")

                .requestMatchers(HttpMethod.GET, "/api/v1/inventory", "/api/v1/inventory/low-stock", "/api/v1/inventory/*", "/api/v1/inventory/*/batches").hasAnyRole("ADMIN", "RECEPTIONIST", "DENTIST")
                .requestMatchers(HttpMethod.POST, "/api/v1/inventory", "/api/v1/inventory/batches", "/api/v1/inventory/*/adjust-stock").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/inventory/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/inventory/*").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/v1/services", "/api/v1/services/*", "/api/v1/services/chairs", "/api/v1/services/chairs/*").hasAnyRole("ADMIN", "RECEPTIONIST", "DENTIST")
                .requestMatchers(HttpMethod.POST, "/api/v1/services", "/api/v1/services/*/activate", "/api/v1/services/chairs").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/services/*", "/api/v1/services/chairs/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/services/*", "/api/v1/services/chairs/*").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/v1/invoices", "/api/v1/invoices/*", "/api/v1/invoices/*/items", "/api/v1/invoices/*/payments").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/invoices", "/api/v1/payments").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/invoices/*/status").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/invoices/*").hasRole("ADMIN")

                .requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/auth/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}
