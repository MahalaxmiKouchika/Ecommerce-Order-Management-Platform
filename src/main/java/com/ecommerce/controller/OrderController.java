package com.ecommerce.controller;

import com.ecommerce.dto.OrderResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Place a new order
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            Authentication authentication
    ) {

        String email = authentication.getName();

        Order order = orderService.placeOrder(email);

        OrderResponse response = OrderResponse.from(order);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Get all orders belonging to the logged-in customer
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            Authentication authentication
    ) {

        String email = authentication.getName();

        List<Order> orders = orderService.getMyOrders(email);

        List<OrderResponse> response = orders
                .stream()
                .map(OrderResponse::from)
                .toList();

        return ResponseEntity.ok(response);
    }

    // Get one order belonging to the logged-in customer
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getMyOrder(
            Authentication authentication,
            @PathVariable Long orderId
    ) {

        String email = authentication.getName();

        Order order = orderService.getMyOrder(
                email,
                orderId
        );

        return ResponseEntity.ok(
                OrderResponse.from(order)
        );
    }
}