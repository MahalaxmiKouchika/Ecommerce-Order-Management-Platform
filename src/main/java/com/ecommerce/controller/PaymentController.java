package com.ecommerce.controller;

import com.ecommerce.dto.PaymentResponse;
import com.ecommerce.entity.Payment;
import com.ecommerce.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/{orderId}")
    public ResponseEntity<PaymentResponse> makePayment(
            @PathVariable Long orderId,
            @RequestParam String paymentMethod
    ) {
        Payment payment = paymentService.makePayment(
                orderId, paymentMethod);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(PaymentResponse.from(payment));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPayment(
            @PathVariable Long orderId
    ) {
        Payment payment = paymentService.getPaymentByOrderId(orderId);

        return ResponseEntity.ok(PaymentResponse.from(payment));
    }
}