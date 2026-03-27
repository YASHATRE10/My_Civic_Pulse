package com.civic.smartcity.service;

import com.civic.smartcity.dto.AuthResponse;
import com.civic.smartcity.dto.LoginRequest;
import com.civic.smartcity.dto.RegisterRequest;
import com.civic.smartcity.model.User;
import com.civic.smartcity.repository.UserRepository;
import com.civic.smartcity.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private static final List<String> VALID_ROLES = List.of("CITIZEN", "ADMIN", "OFFICER");

    public AuthResponse register(RegisterRequest request) {
        String role = request.getRole() != null ? request.getRole().toUpperCase() : "CITIZEN";
        if (!VALID_ROLES.contains(role)) {
            throw new IllegalArgumentException("Invalid role. Must be CITIZEN, ADMIN, or OFFICER.");
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists.");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getUsername(), user.getRole(), "Registration successful!");
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByUsername(request.getUsername());
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Invalid username or password.");
        }
        User user = optionalUser.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password.");
        }
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getUsername(), user.getRole(), "Login successful!");
    }
}
