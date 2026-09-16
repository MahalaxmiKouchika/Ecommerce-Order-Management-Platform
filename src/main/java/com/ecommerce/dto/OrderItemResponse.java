package com.ecommerce.dto;

import com.ecommerce.entity.OrderItem;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId,
        String productName,
        BigDecimal price,
        Integer quantity,
        BigDecimal subtotal
) {

    public static OrderItemResponse from(OrderItem item) {

        BigDecimal subtotal =
                item.getPrice()
                        .multiply(
                                BigDecimal.valueOf(item.getQuantity())
                        );

        return new OrderItemResponse(
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getPrice(),
                item.getQuantity(),
                subtotal
        );
    }
}
