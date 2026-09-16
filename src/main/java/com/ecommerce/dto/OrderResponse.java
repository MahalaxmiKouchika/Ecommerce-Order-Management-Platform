package com.ecommerce.dto;

import com.ecommerce.entity.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long orderId,
        String status,
        BigDecimal totalAmount,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {

    public static OrderResponse from(Order order) {

        List<OrderItemResponse> items =
                order.getItems()
                        .stream()
                        .map(OrderItemResponse::from)
                        .toList();

        return new OrderResponse(
                order.getId(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                items
        );
    }
}