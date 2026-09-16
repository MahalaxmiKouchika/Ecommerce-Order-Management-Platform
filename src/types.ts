export type Role = "ADMIN" | "CUSTOMER";
export type AppTab = "store" | "orders" | "admin";

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type ShipmentStatus =
  | "CREATED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED";

export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: Role;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export interface CartItemResponse {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  cartId: number;
  items: CartItemResponse[];
  total: number;
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  orderId: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItemResponse[];
  payment?: PaymentResponse;
}

export interface ShipmentResponse {
  shipmentId: number;
  orderId: number;
  trackingNumber: string;
  courierName: string;
  status: ShipmentStatus;
  currentLocation: string;
  latitude: number | null;
  longitude: number | null;
  estimatedDelivery: string | null;
  updatedAt: string;
}

export interface PaymentResponse {
  paymentId: number;
  orderId: number;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

export interface AddressRequest {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface AddressResponse {
  id: number;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}
