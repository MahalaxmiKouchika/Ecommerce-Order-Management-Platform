package com.ecommerce.controller;

import com.ecommerce.dto.AddToCartRequest;
import com.ecommerce.dto.CartResponse;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // Add product to cart
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(
            Authentication authentication,
            @Valid @RequestBody AddToCartRequest request
    ) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                cartService.addToCart(email, request)
        );
    }

    // View cart
    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                cartService.getCart(email)
        );
    }

    // Update product quantity
    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponse> updateQuantity(
            Authentication authentication,
            @PathVariable Long productId,
            @RequestParam Integer quantity
    ) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                cartService.updateQuantity(
                        email,
                        productId,
                        quantity
                )
        );
    }

    // Remove product from cart
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeFromCart(
            Authentication authentication,
            @PathVariable Long productId
    ) {

        String email = authentication.getName();

        cartService.removeFromCart(email, productId);

        return ResponseEntity.noContent().build();
    }

    // Clear entire cart
    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            Authentication authentication
    ) {

        String email = authentication.getName();

        cartService.clearCart(email);

        return ResponseEntity.noContent().build();
    }
}