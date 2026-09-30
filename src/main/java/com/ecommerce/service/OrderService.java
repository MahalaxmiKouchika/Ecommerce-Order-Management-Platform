package com.ecommerce.service;

import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.OrderRepository;
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
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // Place order
    @Transactional
    public Order placeOrder(String email) {

        User user = getUser(email);

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {

            Product product = cartItem.getProduct();
            int quantity = cartItem.getQuantity();

            // Check stock
            if (product.getStock() < quantity) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }

            // Reduce stock
            product.setStock(product.getStock() - quantity);
            productRepository.save(product);

            // Calculate subtotal
            BigDecimal subtotal =
                    product.getPrice()
                            .multiply(BigDecimal.valueOf(quantity));

            // Create order item
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(quantity)
                    .price(product.getPrice())
                    .build();

            orderItems.add(orderItem);

            totalAmount = totalAmount.add(subtotal);
        }

        // Create order
        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PLACED)
                .totalAmount(totalAmount)
                .items(orderItems)
                .build();

        // Connect each order item to the order
        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }

        Order savedOrder = orderRepository.save(order);

        // Clear cart after successful order
        cart.getItems().clear();
        cartRepository.save(cart);

        return savedOrder;
    }

    // Get customer's orders
    @Transactional(readOnly = true)
    public List<Order> getMyOrders(String email) {

        User user = getUser(email);

        return orderRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    // Get one customer's order
    @Transactional(readOnly = true)
    public Order getMyOrder(
            String email,
            Long orderId
    ) {

        User user = getUser(email);

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: " + orderId
                        )
                );

        // Make sure the order belongs to the logged-in customer
        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "You are not allowed to view this order"
            );
        }

        return order;
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
}