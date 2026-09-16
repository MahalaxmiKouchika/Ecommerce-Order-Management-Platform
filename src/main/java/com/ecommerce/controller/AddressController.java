package com.ecommerce.controller;

import com.ecommerce.dto.AddressRequest;
import com.ecommerce.dto.AddressResponse;
import com.ecommerce.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    public ResponseEntity<AddressResponse> addAddress(
            Authentication authentication,
            @Valid @RequestBody AddressRequest request) {

        String email = authentication.getName();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(addressService.addAddress(email, request));
    }

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getMyAddresses(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                addressService.getMyAddresses(email)
        );
    }
}