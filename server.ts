import dotenv from "dotenv";
dotenv.config({ override: true });

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { initPostgres, isPgConnected, pgPool } from "./src/server/db";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-for-ecommerce-platform-2025";
const ADMIN_SECURITY_KEY = process.env.ADMIN_SECURITY_KEY || "ADM-SECURE-9481";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------------------------------------
// Data Models & In-Memory Store
// ----------------------------------------------------

interface DbUser {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "CUSTOMER";
}

interface DbProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

interface DbCartItem {
  productId: number;
  quantity: number;
}

interface DbCart {
  id: number;
  userId: number;
  items: DbCartItem[];
}

interface DbOrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface DbOrder {
  id: number;
  userId: number;
  status: "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  items: DbOrderItem[];
}

interface DbPayment {
  id: number;
  orderId: number;
  amount: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

interface DbShipment {
  id: number;
  orderId: number;
  trackingNumber: string;
  courierName: string;
  status: "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "RETURNED";
  currentLocation: string;
  latitude: number | null;
  longitude: number | null;
  estimatedDelivery: string | null;
  updatedAt: string;
}

interface DbAddress {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

// In-Memory Database
const users: DbUser[] = [];
const products: DbProduct[] = [];
const carts = new Map<number, DbCart>();
const orders: DbOrder[] = [];
const payments: DbPayment[] = [];
const shipments: DbShipment[] = [];
const addresses: DbAddress[] = [];

let nextUserId = 1;
let nextProductId = 1;
let nextCartId = 1;
let nextOrderId = 1;
let nextPaymentId = 1;
let nextShipmentId = 1;
let nextAddressId = 1;

// ----------------------------------------------------
// Database Initialization
// ----------------------------------------------------

function initDatabase() {
  // Load Products from CSV
  const possibleCsvPaths = [
    path.join(process.cwd(), "src/main/resources/products.csv"),
    path.join(process.cwd(), "products.csv"),
    path.join(process.cwd(), "public/products.csv"),
  ];

  let csvLoaded = false;
  for (const csvPath of possibleCsvPaths) {
    if (fs.existsSync(csvPath)) {
      try {
        const content = fs.readFileSync(csvPath, "utf-8");
        const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
        // Header: name,description,price,stock,category,imageUrl
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          // CSV parser supporting quotes
          const fields: string[] = [];
          let current = "";
          let inQuotes = false;
          for (let c = 0; c < line.length; c++) {
            const char = line[c];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              fields.push(current);
              current = "";
            } else {
              current += char;
            }
          }
          fields.push(current);

          if (fields.length >= 6) {
            const name = fields[0].trim();
            const description = fields[1].trim();
            const price = parseFloat(fields[2].trim()) || 0;
            const stock = parseInt(fields[3].trim(), 10) || 0;
            const category = fields[4].trim();
            const imageUrl = fields[5].trim();

            products.push({
              id: nextProductId++,
              name,
              description,
              price,
              stock,
              category,
              imageUrl,
            });
          }
        }
        console.log(`[Database] Loaded ${products.length} products from ${csvPath}`);
        csvLoaded = true;
        break;
      } catch (err) {
        console.error(`Error loading CSV from ${csvPath}:`, err);
      }
    }
  }

  // Fallback products if CSV was not found or empty
  if (!csvLoaded || products.length === 0) {
    const fallbackProducts = [
      {
        name: "Essence Mascara Lash Princess",
        description: "Volumizing and lengthening mascara for everyday makeup.",
        price: 699,
        stock: 80,
        category: "Beauty",
        imageUrl: "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp",
      },
      {
        name: "Red Lipstick",
        description: "Rich red lipstick with a smooth, long-lasting finish.",
        price: 499,
        stock: 100,
        category: "Beauty",
        imageUrl: "https://cdn.dummyjson.com/product-images/beauty/red-lipstick/1.webp",
      },
      {
        name: "Calvin Klein CK One",
        description: "Fresh unisex fragrance with a clean modern character.",
        price: 3999,
        stock: 35,
        category: "Fragrances",
        imageUrl: "https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/1.webp",
      },
      {
        name: "Smartphone Pro 128GB",
        description: "Modern smartphone with a bright display and fast performance.",
        price: 24999,
        stock: 35,
        category: "Electronics",
        imageUrl: "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/1.webp",
      },
      {
        name: "Wireless Earbuds",
        description: "Compact wireless earbuds with a charging case.",
        price: 2499,
        stock: 75,
        category: "Electronics",
        imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp",
      },
    ];
    for (const p of fallbackProducts) {
      products.push({ id: nextProductId++, ...p });
    }
  }
}

initDatabase();
initPostgres().catch((e) => console.error("[PostgreSQL] Init error:", e));

// ----------------------------------------------------
// Authentication Helpers & Middleware
// ----------------------------------------------------

interface AuthPayload {
  sub: string; // email
  id: number;
  name: string;
  role: "ADMIN" | "CUSTOMER";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

function generateToken(user: DbUser): string {
  return jwt.sign(
    {
      sub: user.email,
      id: user.id,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization token" });
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin role required." });
  }
  next();
}

function getOrCreateCart(userId: number): DbCart {
  let cart = carts.get(userId);
  if (!cart) {
    cart = {
      id: nextCartId++,
      userId,
      items: [],
    };
    carts.set(userId, cart);
  }
  return cart;
}

function formatCartResponse(cart: DbCart) {
  const items = cart.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const price = product ? product.price : 0;
    const subtotal = price * item.quantity;
    return {
      productId: item.productId,
      productName: product ? product.name : "Unknown Product",
      price,
      quantity: item.quantity,
      subtotal,
    };
  });

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    cartId: cart.id,
    items,
    total,
  };
}

// ----------------------------------------------------
// REST API Routes
// ----------------------------------------------------

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    appName: "ecommerce-backend",
    productCount: products.length,
    usersCount: users.length,
    ordersCount: orders.length,
    postgres: {
      connected: isPgConnected,
      database: process.env.PGDATABASE || "ecommerce_db",
      host: process.env.PGHOST || "localhost",
      port: parseInt(String(process.env.PGPORT || "5432").replace(/.*:/, ""), 10) || 5432,
    },
  });
});

// 2. Auth Routes (/api/auth)
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role, adminSecurityKey } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Email is already registered" });
  }

  // Strict Admin registration gate
  let assignedRole: "ADMIN" | "CUSTOMER" = "CUSTOMER";
  if (role === "ADMIN") {
    if (!adminSecurityKey || adminSecurityKey.trim() !== ADMIN_SECURITY_KEY) {
      return res.status(403).json({
        error: "Admin registration rejected: Valid Admin Master Security Passcode is required.",
      });
    }
    assignedRole = "ADMIN";
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  let userId = nextUserId++;

  if (isPgConnected) {
    try {
      const pgRes = await pgPool.query(
        `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
        [name, email.toLowerCase(), passwordHash, assignedRole]
      );
      if (pgRes.rows[0]) {
        userId = pgRes.rows[0].id;
      }
    } catch (dbErr: any) {
      if (dbErr.code === "23505") {
        return res.status(400).json({ error: "Email is already registered in database" });
      }
      console.error("[PostgreSQL] Register insert error:", dbErr);
    }
  }

  const newUser: DbUser = {
    id: userId,
    name,
    email,
    passwordHash,
    role: assignedRole,
  };
  users.push(newUser);

  const token = generateToken(newUser);
  return res.status(201).json({
    token,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password, adminSecurityKey } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  // Check PostgreSQL if user not found in-memory
  if (!user && isPgConnected) {
    try {
      const pgRes = await pgPool.query(
        `SELECT id, name, email, password, role FROM users WHERE email = $1`,
        [email.toLowerCase()]
      );
      if (pgRes.rows[0]) {
        const row = pgRes.rows[0];
        user = {
          id: row.id,
          name: row.name,
          email: row.email,
          passwordHash: row.password,
          role: row.role as "ADMIN" | "CUSTOMER",
        };
        users.push(user);
      }
    } catch (dbErr) {
      console.error("[PostgreSQL] User lookup error:", dbErr);
    }
  }

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Strict Admin authentication check:
  // Admin accounts CANNOT be accessed easily - they require the Admin Security Passcode!
  if (user.role === "ADMIN") {
    if (!adminSecurityKey || adminSecurityKey.trim() !== ADMIN_SECURITY_KEY) {
      return res.status(403).json({
        error: "Admin Authorization Required: High-privilege administrator access requires the valid Admin Security Passcode.",
        requiresAdminSecurityKey: true,
      });
    }
  }

  const token = generateToken(user);
  return res.json({
    token,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// 3. Products Routes (/api/products)
app.get("/api/products", (req, res) => {
  const { category, search } = req.query;
  let result = [...products];

  if (category && typeof category === "string") {
    result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

app.get("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: `Product not found with id: ${id}` });
  }
  res.json(product);
});

app.post("/api/products", requireAuth, requireAdmin, async (req, res) => {
  const { name, description, price, stock, category, imageUrl } = req.body;

  if (!name || price === undefined || stock === undefined || !category) {
    return res.status(400).json({ error: "name, price, stock, and category are required" });
  }

  let prodId = nextProductId++;
  const img = imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80";

  if (isPgConnected) {
    try {
      const pgRes = await pgPool.query(
        `INSERT INTO products (name, description, price, stock, category, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [name, description || "", Number(price), Number(stock), category, img]
      );
      if (pgRes.rows[0]) {
        prodId = pgRes.rows[0].id;
      }
    } catch (err) {
      console.error("[PostgreSQL] Insert product error:", err);
    }
  }

  const newProduct: DbProduct = {
    id: prodId,
    name,
    description: description || "",
    price: Number(price),
    stock: Number(stock),
    category,
    imageUrl: img,
  };

  products.push(newProduct);
  return res.status(201).json(newProduct);
});

app.put("/api/products/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: `Product not found with id: ${id}` });
  }

  const { name, description, price, stock, category, imageUrl } = req.body;
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (category !== undefined) product.category = category;
  if (imageUrl !== undefined) product.imageUrl = imageUrl;

  if (isPgConnected) {
    try {
      await pgPool.query(
        `UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7`,
        [product.name, product.description, product.price, product.stock, product.category, product.imageUrl, id]
      );
    } catch (err) {
      console.error("[PostgreSQL] Update product error:", err);
    }
  }

  return res.json(product);
});

app.delete("/api/products/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Product not found with id: ${id}` });
  }
  products.splice(index, 1);

  if (isPgConnected) {
    try {
      await pgPool.query(`DELETE FROM products WHERE id = $1`, [id]);
    } catch (err) {
      console.error("[PostgreSQL] Delete product error:", err);
    }
  }

  return res.status(204).send();
});

// 4. Cart Routes (/api/cart)
app.get("/api/cart", requireAuth, (req, res) => {
  const cart = getOrCreateCart(req.user!.id);
  res.json(formatCartResponse(cart));
});

app.post("/api/cart/items", requireAuth, (req, res) => {
  const { productId, quantity } = req.body;
  const prodId = Number(productId);
  const qty = Number(quantity) || 1;

  const product = products.find((p) => p.id === prodId);
  if (!product) {
    return res.status(404).json({ error: `Product not found with id: ${prodId}` });
  }

  if (product.stock < qty) {
    return res.status(400).json({ error: "Insufficient stock" });
  }

  const cart = getOrCreateCart(req.user!.id);
  const existingItem = cart.items.find((item) => item.productId === prodId);

  if (existingItem) {
    const combined = existingItem.quantity + qty;
    if (combined > product.stock) {
      return res.status(400).json({ error: "Requested quantity exceeds available stock" });
    }
    existingItem.quantity = combined;
  } else {
    cart.items.push({ productId: prodId, quantity: qty });
  }

  res.json(formatCartResponse(cart));
});

app.put("/api/cart/items/:productId", requireAuth, (req, res) => {
  const prodId = parseInt(req.params.productId, 10);
  const quantity = Number(req.query.quantity ?? req.body.quantity);

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1" });
  }

  const product = products.find((p) => p.id === prodId);
  if (!product) {
    return res.status(404).json({ error: `Product not found with id: ${prodId}` });
  }

  if (quantity > product.stock) {
    return res.status(400).json({ error: "Requested quantity exceeds available stock" });
  }

  const cart = getOrCreateCart(req.user!.id);
  const item = cart.items.find((i) => i.productId === prodId);
  if (!item) {
    return res.status(404).json({ error: "Product is not in cart" });
  }

  item.quantity = quantity;
  res.json(formatCartResponse(cart));
});

app.delete("/api/cart/items/:productId", requireAuth, (req, res) => {
  const prodId = parseInt(req.params.productId, 10);
  const cart = getOrCreateCart(req.user!.id);

  const idx = cart.items.findIndex((i) => i.productId === prodId);
  if (idx !== -1) {
    cart.items.splice(idx, 1);
  }
  res.status(204).send();
});

app.delete("/api/cart", requireAuth, (req, res) => {
  const cart = getOrCreateCart(req.user!.id);
  cart.items = [];
  res.status(204).send();
});

function formatOrder(o: DbOrder) {
  const payment = payments.find((p) => p.orderId === o.id);
  return {
    orderId: o.id,
    status: o.status,
    totalAmount: o.totalAmount,
    createdAt: o.createdAt,
    items: o.items,
    payment: payment
      ? {
          paymentId: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          createdAt: payment.createdAt,
        }
      : undefined,
  };
}

// 5. Order Routes (/api/orders)
app.post("/api/orders", requireAuth, (req, res) => {
  const cart = getOrCreateCart(req.user!.id);
  if (cart.items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  // Validate stock for all items
  for (const item of cart.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({
        error: `Insufficient stock for product: ${product ? product.name : item.productId}`,
      });
    }
  }

  // Deduct stock and build items
  const orderItems: DbOrderItem[] = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = products.find((p) => p.id === item.productId)!;
    product.stock -= item.quantity;
    const subtotal = product.price * item.quantity;
    totalAmount += subtotal;

    orderItems.push({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  const newOrder: DbOrder = {
    id: nextOrderId++,
    userId: req.user!.id,
    status: "PLACED",
    totalAmount,
    createdAt: new Date().toISOString(),
    items: orderItems,
  };
  orders.push(newOrder);

  // Clear user cart
  cart.items = [];

  return res.status(201).json(formatOrder(newOrder));
});

app.get("/api/orders", requireAuth, (req, res) => {
  const userOrders = orders
    .filter((o) => o.userId === req.user!.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(userOrders.map((o) => formatOrder(o)));
});

app.get("/api/orders/:orderId", requireAuth, (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return res.status(404).json({ error: `Order not found with id: ${orderId}` });
  }

  if (order.userId !== req.user!.id && req.user!.role !== "ADMIN") {
    return res.status(403).json({ error: "You are not allowed to view this order" });
  }

  res.json(formatOrder(order));
});

// 6. Payment Routes (/api/payments)
app.post("/api/payments/:orderId", requireAuth, (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  const rawMethod = (req.body.paymentMethod || req.query.paymentMethod || "UPI").toString().toUpperCase();
  const { upiRef } = req.body;

  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: `Order not found with id: ${orderId}` });
  }

  if (order.userId !== req.user!.id && req.user!.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied to pay for this order" });
  }

  const existingPayment = payments.find((p) => p.orderId === orderId);
  if (existingPayment && existingPayment.status === "SUCCESS") {
    return res.status(400).json({ error: `Payment already completed for order: ${orderId}` });
  }

  let transactionId = "";
  let paymentStatus: "SUCCESS" | "PENDING" = "SUCCESS";
  let resolvedMethod = "UPI";

  if (rawMethod === "CASH_ON_DELIVERY" || rawMethod === "COD") {
    resolvedMethod = "CASH_ON_DELIVERY";
    transactionId = `COD-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${orderId}`;
    paymentStatus = "PENDING";
    order.status = "CONFIRMED";
  } else {
    resolvedMethod = "UPI";
    transactionId = upiRef || `UPI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    paymentStatus = "SUCCESS";
    order.status = "CONFIRMED";
  }

  if (existingPayment) {
    existingPayment.amount = order.totalAmount;
    existingPayment.status = paymentStatus;
    existingPayment.paymentMethod = resolvedMethod;
    existingPayment.transactionId = transactionId;
    existingPayment.createdAt = new Date().toISOString();
    return res.status(200).json(existingPayment);
  }

  const payment: DbPayment = {
    id: nextPaymentId++,
    orderId,
    amount: order.totalAmount,
    status: paymentStatus,
    paymentMethod: resolvedMethod,
    transactionId,
    createdAt: new Date().toISOString(),
  };
  payments.push(payment);

  return res.status(201).json({
    paymentId: payment.id,
    orderId: payment.orderId,
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    transactionId: payment.transactionId,
    createdAt: payment.createdAt,
  });
});

app.get("/api/payments/order/:orderId", requireAuth, (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  const payment = payments.find((p) => p.orderId === orderId);

  if (!payment) {
    return res.status(404).json({ error: `Payment not found for order: ${orderId}` });
  }

  res.json({
    paymentId: payment.id,
    orderId: payment.orderId,
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    transactionId: payment.transactionId,
    createdAt: payment.createdAt,
  });
});

// 7. Address Routes (/api/addresses)
app.post("/api/addresses", requireAuth, (req, res) => {
  const { fullName, phone, addressLine, city, state, pincode } = req.body;

  if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
    return res.status(400).json({ error: "All address fields are required" });
  }

  const address: DbAddress = {
    id: nextAddressId++,
    userId: req.user!.id,
    fullName,
    phone,
    addressLine,
    city,
    state,
    pincode,
  };
  addresses.push(address);

  res.status(201).json(address);
});

app.get("/api/addresses", requireAuth, (req, res) => {
  const userAddresses = addresses.filter((a) => a.userId === req.user!.id);
  res.json(userAddresses);
});

// 8. Shipment Routes & Order Tracking
app.get("/api/orders/:orderId/tracking", requireAuth, (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  const shipment = shipments.find((s) => s.orderId === orderId);

  if (!shipment) {
    return res.status(404).json({ error: `Shipment not found for order: ${orderId}` });
  }

  res.json({
    shipmentId: shipment.id,
    orderId: shipment.orderId,
    trackingNumber: shipment.trackingNumber,
    courierName: shipment.courierName,
    status: shipment.status,
    currentLocation: shipment.currentLocation,
    latitude: shipment.latitude,
    longitude: shipment.longitude,
    estimatedDelivery: shipment.estimatedDelivery,
    updatedAt: shipment.updatedAt,
  });
});

// 9. Admin Order & Shipment Management (/api/admin)
app.get("/api/admin/orders", requireAuth, requireAdmin, (req, res) => {
  res.json(orders.map((o) => formatOrder(o)));
});

app.get("/api/admin/orders/:orderId", requireAuth, requireAdmin, (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: `Order not found with id: ${orderId}` });
  }
  res.json(formatOrder(order));
});

app.put("/api/admin/orders/:orderId/status", requireAuth, requireAdmin, (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  const status = (req.query.status as any) || req.body.status;

  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: `Order not found with id: ${orderId}` });
  }

  order.status = status;
  res.json(formatOrder(order));
});

app.post("/api/admin/orders/:orderId/shipment", requireAuth, requireAdmin, (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  const courierName = (req.query.courierName as string) || req.body.courierName || "FedEx Express";
  const estimatedDelivery =
    (req.query.estimatedDelivery as string) ||
    req.body.estimatedDelivery ||
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: `Order not found with id: ${orderId}` });
  }

  const existing = shipments.find((s) => s.orderId === orderId);
  if (existing) {
    return res.status(400).json({ error: `Shipment already exists for order: ${orderId}` });
  }

  const trackingNumber = `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const shipment: DbShipment = {
    id: nextShipmentId++,
    orderId,
    trackingNumber,
    courierName,
    status: "CREATED",
    currentLocation: "Regional Fulfillment Hub",
    latitude: 37.7749,
    longitude: -122.4194,
    estimatedDelivery,
    updatedAt: new Date().toISOString(),
  };

  shipments.push(shipment);

  res.status(201).json({
    shipmentId: shipment.id,
    orderId: shipment.orderId,
    trackingNumber: shipment.trackingNumber,
    courierName: shipment.courierName,
    status: shipment.status,
    currentLocation: shipment.currentLocation,
    latitude: shipment.latitude,
    longitude: shipment.longitude,
    estimatedDelivery: shipment.estimatedDelivery,
    updatedAt: shipment.updatedAt,
  });
});

app.put("/api/admin/orders/:orderId/shipment", requireAuth, requireAdmin, (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  const status = (req.query.status as any) || req.body.status;
  const currentLocation = (req.query.currentLocation as string) || req.body.currentLocation;
  const latitude = req.query.latitude ? parseFloat(req.query.latitude as string) : req.body.latitude;
  const longitude = req.query.longitude ? parseFloat(req.query.longitude as string) : req.body.longitude;

  const shipment = shipments.find((s) => s.orderId === orderId);
  if (!shipment) {
    return res.status(404).json({ error: `Shipment not found for order: ${orderId}` });
  }

  if (status) shipment.status = status;
  if (currentLocation) shipment.currentLocation = currentLocation;
  if (latitude !== undefined) shipment.latitude = latitude;
  if (longitude !== undefined) shipment.longitude = longitude;
  shipment.updatedAt = new Date().toISOString();

  // Synchronize Order status
  const order = orders.find((o) => o.id === orderId);
  if (order && status) {
    if (["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(status)) {
      order.status = "SHIPPED";
    } else if (status === "DELIVERED") {
      order.status = "DELIVERED";
    } else if (status === "RETURNED") {
      order.status = "CANCELLED";
    }
  }

  res.json({
    shipmentId: shipment.id,
    orderId: shipment.orderId,
    trackingNumber: shipment.trackingNumber,
    courierName: shipment.courierName,
    status: shipment.status,
    currentLocation: shipment.currentLocation,
    latitude: shipment.latitude,
    longitude: shipment.longitude,
    estimatedDelivery: shipment.estimatedDelivery,
    updatedAt: shipment.updatedAt,
  });
});

// ----------------------------------------------------
// Production / Dev Vite Serving
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Ecommerce Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
