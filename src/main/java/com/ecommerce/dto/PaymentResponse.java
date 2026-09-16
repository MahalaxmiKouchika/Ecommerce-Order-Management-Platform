package com.ecommerce.dto;

import com.ecommerce.entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long paymentId,
        Long orderId,
        BigDecimal amount,
        String status,
        String paymentMethod,
        String transactionId,
        LocalDateTime createdAt
) {

    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getAmount(),
                payment.getStatus().name(),
                payment.getPaymentMethod(),
                payment.getTransactionId(),
                payment.getCreatedAt()
        );
    }
}