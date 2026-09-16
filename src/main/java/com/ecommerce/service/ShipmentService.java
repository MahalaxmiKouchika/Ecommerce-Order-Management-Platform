package com.ecommerce.service;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.Shipment;
import com.ecommerce.entity.ShipmentStatus;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;

    // --------------------------------------------------
    // Create Shipment
    // --------------------------------------------------

    @Transactional
    public Shipment createShipment(
            Long orderId,
            String courierName,
            LocalDateTime estimatedDelivery
    ) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: " + orderId
                        ));

        if (shipmentRepository.findByOrderId(orderId).isPresent()) {
            throw new IllegalArgumentException(
                    "Shipment already exists for order: " + orderId
            );
        }

        String trackingNumber =
                "TRK-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();

        Shipment shipment = Shipment.builder()
                .order(order)
                .trackingNumber(trackingNumber)
                .courierName(courierName)
                .status(ShipmentStatus.CREATED)
                .currentLocation("Warehouse")
                .latitude(null)
                .longitude(null)
                .estimatedDelivery(estimatedDelivery)
                .build();

        return shipmentRepository.save(shipment);
    }

    // --------------------------------------------------
    // Get Shipment By Order ID
    // --------------------------------------------------

    @Transactional(readOnly = true)
    public Shipment getShipmentByOrderId(Long orderId) {

        return shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Shipment not found for order: " + orderId
                        ));
    }

    // --------------------------------------------------
    // Update Shipment
    // --------------------------------------------------

    @Transactional
    public Shipment updateShipment(
            Long orderId,
            ShipmentStatus status,
            String currentLocation,
            Double latitude,
            Double longitude
    ) {

        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Shipment not found for order: " + orderId
                        ));

        // Update shipment information
        shipment.setStatus(status);
        shipment.setCurrentLocation(currentLocation);
        shipment.setLatitude(latitude);
        shipment.setLongitude(longitude);

        // Get the order connected to this shipment
        Order order = shipment.getOrder();

        // Synchronize Order Status with Shipment Status
        switch (status) {

            case CREATED -> {
                // Keep existing order status
            }

            case PICKED_UP, IN_TRANSIT -> {
                order.setStatus(OrderStatus.SHIPPED);
            }

            case OUT_FOR_DELIVERY -> {
                order.setStatus(OrderStatus.SHIPPED);
            }

            case DELIVERED -> {
                order.setStatus(OrderStatus.DELIVERED);
            }

            case RETURNED -> {
                order.setStatus(OrderStatus.CANCELLED);
            }
        }

        // Save updated order
        orderRepository.save(order);

        // Save updated shipment
        return shipmentRepository.save(shipment);
    }
}