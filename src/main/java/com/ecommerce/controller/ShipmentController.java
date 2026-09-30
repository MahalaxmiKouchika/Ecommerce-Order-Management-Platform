package com.ecommerce.controller;

import com.ecommerce.dto.ShipmentResponse;
import com.ecommerce.entity.Shipment;
import com.ecommerce.entity.ShipmentStatus;
import com.ecommerce.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping("/admin/orders/{orderId}/shipment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipmentResponse> createShipment(
            @PathVariable Long orderId,
            @RequestParam String courierName,
            @RequestParam LocalDateTime estimatedDelivery
    ) {

        Shipment shipment = shipmentService.createShipment(
                orderId,
                courierName,
                estimatedDelivery
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ShipmentResponse.from(shipment));
    }

    @GetMapping("/orders/{orderId}/tracking")
    public ResponseEntity<ShipmentResponse> getTracking(
            @PathVariable Long orderId
    ) {

        Shipment shipment =
                shipmentService.getShipmentByOrderId(orderId);

        return ResponseEntity.ok(
                ShipmentResponse.from(shipment)
        );
    }

    @PutMapping("/admin/orders/{orderId}/shipment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipmentResponse> updateShipment(
            @PathVariable Long orderId,
            @RequestParam ShipmentStatus status,
            @RequestParam String currentLocation,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude
    ) {

        Shipment shipment =
                shipmentService.updateShipment(
                        orderId,
                        status,
                        currentLocation,
                        latitude,
                        longitude
                );

        return ResponseEntity.ok(
                ShipmentResponse.from(shipment)
        );
    }
}