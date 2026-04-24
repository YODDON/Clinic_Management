package com.dentalpro;

import com.dentalpro.config.CorsProperties;
import com.dentalpro.config.JwtConfig;
import com.dentalpro.config.OpenApiProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({JwtConfig.class, CorsProperties.class, OpenApiProperties.class})
public class DentalProApplication {
    public static void main(String[] args) {
        SpringApplication.run(DentalProApplication.class, args);
    }
}

