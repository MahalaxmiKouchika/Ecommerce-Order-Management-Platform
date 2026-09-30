package com.ecommerce.service;

import com.ecommerce.dto.AddToCartRequest;
import com.ecommerce.dto.CartItemResponse;
import com.ecommerce.dto.CartResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // Add product to cart
    @Transactional
    public CartResponse addToCart(
            String email,
            AddToCartRequest request
    ) {

        User user = getUser(email);

        Product product = productRepository
                .findById(request.productId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: "
                                        + request.productId()
                        )
                );

        // Check available stock
        if (product.getStock() < request.quantity()) {
            throw new IllegalArgumentException(
                    "Insufficient stock"
            );
        }

        // Find existing cart or create a new cart
        Cart cart = cartRepository
                .findByUserId(user.getId())
                .orElseGet(() -> {

                    Cart newCart = Cart.builder()
                            .user(user)
                            .items(new ArrayList<>())
                            .build();

                    return cartRepository.save(newCart);
                });

        // Check whether product is already in cart
        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(
                        cart.getId(),
                        product.getId()
                )
                .orElse(null);

        if (cartItem != null) {

            int newQuantity =
                    cartItem.getQuantity()
                            + request.quantity();

            // Check stock again for combined quantity
            if (newQuantity > product.getStock()) {
                throw new IllegalArgumentException(
                        "Requested quantity exceeds available stock"
                );
            }

            cartItem.setQuantity(newQuantity);

        } else {

            cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.quantity())
                    .build();

            cart.getItems().add(cartItem);
        }

        cartItemRepository.save(cartItem);

        return buildCartResponse(cart);
    }

    // Get customer cart
    @Transactional(readOnly = true)
    public CartResponse getCart(String email) {

        User user = getUser(email);

        Cart cart = cartRepository
                .findByUserId(user.getId())
                .orElseGet(() ->
                        Cart.builder()
                                .user(user)
                                .items(new ArrayList<>())
                                .build()
                );

        return buildCartResponse(cart);
    }

    // Update product quantity
    @Transactional
    public CartResponse updateQuantity(
            String email,
            Long productId,
            Integer quantity
    ) {

        User user = getUser(email);

        Cart cart = cartRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart not found"
                        )
                );

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(
                        cart.getId(),
                        productId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product is not in cart"
                        )
                );

        Product product = cartItem.getProduct();

        if (quantity == null || quantity < 1) {
            throw new IllegalArgumentException(
                    "Quantity must be at least 1"
            );
        }

        if (quantity > product.getStock()) {
            throw new IllegalArgumentException(
                    "Requested quantity exceeds available stock"
            );
        }

        cartItem.setQuantity(quantity);

        cartItemRepository.save(cartItem);

        return buildCartResponse(cart);
    }

    // Remove product from cart
    @Transactional
    public void removeFromCart(
            String email,
            Long productId
    ) {

        User user = getUser(email);

        Cart cart = cartRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart not found"
                        )
                );

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(
                        cart.getId(),
                        productId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product is not in cart"
                        )
                );

        cart.getItems().remove(cartItem);

        cartItemRepository.delete(cartItem);
    }

    // Clear entire cart
    @Transactional
    public void clearCart(String email) {

        User user = getUser(email);

        Cart cart = cartRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart not found"
                        )
                );

        cart.getItems().clear();

        cartRepository.save(cart);
    }

    // Find user by email
    private User getUser(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );
    }

    // Build cart response
    private CartResponse buildCartResponse(Cart cart) {

        List<CartItemResponse> items =
                cart.getItems()
                        .stream()
                        .map(item -> {

                            BigDecimal subtotal =
                                    item.getProduct()
                                            .getPrice()
                                            .multiply(
                                                    BigDecimal.valueOf(
                                                            item.getQuantity()
                                                    )
                                            );

                            return new CartItemResponse(
                                    item.getProduct().getId(),
                                    item.getProduct().getName(),
                                    item.getProduct().getPrice(),
                                    item.getQuantity(),
                                    subtotal
                            );
                        })
                        .toList();

        BigDecimal total =
                items.stream()
                        .map(CartItemResponse::subtotal)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return new CartResponse(
                cart.getId(),
                items,
                total
        );
    }
}