package com.smartlogos.note.config;

import com.smartlogos.note.entity.User;
import com.smartlogos.note.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Optional;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/api/**").permitAll()  // API无需认证
                        .anyRequest().authenticated()  // 其他页面需要认证
                )
                .formLogin(form -> form
                        .defaultSuccessUrl("/api/documents/user/1", true)  // 登录成功后直接跳转到用户文档API
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("/login?logout")  // 退出后跳转到登录页
                        .permitAll()
                )
                .csrf(csrf -> csrf.disable());

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> {
            // 先尝试用用户名查找
            Optional<User> user = userRepository.findByUsername(username);

            // 如果用户名找不到，尝试用邮箱查找
            if (user.isEmpty()) {
                user = userRepository.findByEmail(username);
            }

            User finalUser = user.orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + username));

            return org.springframework.security.core.userdetails.User.builder()
                    .username(finalUser.getUsername())
                    .password(finalUser.getPassword())
                    .roles("USER")
                    .build();
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // 注意：NoOpPasswordEncoder不加密，仅用于测试环境！
        return NoOpPasswordEncoder.getInstance();
    }
}