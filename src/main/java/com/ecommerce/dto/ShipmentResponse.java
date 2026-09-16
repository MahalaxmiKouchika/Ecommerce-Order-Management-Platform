package com.ecommerce.dto;

import com.ecommerce.entity.Shipment;

import java.time.LocalDateTime;

public record ShipmentResponse(
        Long shipmentId,
        Long orderId,
        String trackingNumber,
        String courierName,
        String status,
        String currentLocation,
        Double latitude,
        Double longitude,
        LocalDateTime estimatedDelivery,
        LocalDateTime updatedAt
) {

    public static ShipmentResponse from(Shipment shipment) {

        return new ShipmentResponse(
                shipment.getId(),
                shipment.getOrder().getId(),
                shipment.getTrackingNumber(),
                shipment.getCourierName(),
                shipment.getStatus().name(),
                shipment.getCurrentLocation(),
                shipment.getLatitude(),
                shipment.getLongitude(),
                shipment.getEstimatedDelivery(),
                shipment.getUpdatedAt()
        );
    }
}