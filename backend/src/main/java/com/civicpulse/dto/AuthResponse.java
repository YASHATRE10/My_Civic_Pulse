package com.civicpulse.dto;

import com.civicpulse.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserView user;

    @Getter
    @AllArgsConstructor
    public static class UserView {
        private Long id;
        private String name;
        private String email;
        private Role role;
        private String phone;
        private boolean approved;
    }
}
