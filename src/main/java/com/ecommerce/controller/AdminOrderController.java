package com.ecommerce.controller;

import com.ecommerce.dto.OrderResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.service.AdminOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        List<Order> orders = adminOrderService.getAllOrders();

        List<OrderResponse> response = orders.stream()
                .map(OrderResponse::from)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long orderId
    ) {

        Order order = adminOrderService.getOrderById(orderId);

        return ResponseEntity.ok(
                OrderResponse.from(order)
        );
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {

        Order order = adminOrderService.updateOrderStatus(
                orderId,
                status
        );

        return ResponseEntity.ok(
                OrderResponse.from(order)
        );
    }
}