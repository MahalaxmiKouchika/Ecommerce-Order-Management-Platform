package com.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;

public record AddressRequest(

        @NotBlank
        String fullName,

        @NotBlank
        String phone,

        @NotBlank
        String addressLine,

        @NotBlank
        String city,

        @NotBlank
        String state,

        @NotBlank
        String pincode
) {
}