package com.ecommerce.dto;

import com.ecommerce.entity.Address;

public record AddressResponse(
        Long id,
        String fullName,
        String phone,
        String addressLine,
        String city,
        String state,
        String pincode
) {

    public static AddressResponse from(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getFullName(),
                address.getPhone(),
                address.getAddressLine(),
                address.getCity(),
                address.getState(),
                address.getPincode()
        );
    }
}