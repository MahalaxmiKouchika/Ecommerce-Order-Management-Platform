# E-Commerce & Order Management Platform (Full Stack)

A high-performance, enterprise-grade e-commerce order management system with a product catalog of 250+ products, real-time cart, checkout, live shipment tracking, verified customer review & star rating system, and an admin operations portal.

Connected directly to **Supabase Cloud PostgreSQL** with bcrypt password encryption.

---

## 🚀 Live Preview & Deployment Options

### 1. AI Studio Dev & Shared URLs
- **Development App**: Available directly in Google AI Studio
- **Shared App**: Readily accessible for team reviews

### 2. Free Cloud Deployment (Render / Railway / Cloud Run)

#### Option A: Deploy on Render.com (Recommended Free Hosting)
1. Push this project to GitHub.
2. Go to **[Render.com](https://render.com)** &rarr; **New Web Service** &rarr; Connect your GitHub repository.
3. Configure settings:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `DATABASE_URL`: `postgresql://postgres:supabase-password-maha@db.mkzdyspejdfeikilscgt.supabase.co:5432/postgres`
   - `JWT_SECRET`: `super-secret-jwt-key-for-ecommerce-platform-2025`
   - `ADMIN_SECURITY_KEY`: `ADM-SECURE-9481`
5. Click **Deploy**.

#### Option B: Deploy with Docker
```bash
# Build the container image
docker build -t ecommerce-platform .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:supabase-password-maha@db.mkzdyspejdfeikilscgt.supabase.co:5432/postgres" \
  -e JWT_SECRET="super-secret-jwt-key-for-ecommerce-platform-2025" \
  -e ADMIN_SECURITY_KEY="ADM-SECURE-9481" \
  ecommerce-platform
```

#### Option C: Java Spring Boot Backend (JFS Mode)
To run the companion Java Spring Boot backend using Maven:
```bash
# Verify Java 17+ is installed
java -version

# Launch Spring Boot (configured with Supabase in application.properties)
./mvnw spring-boot:run
```

---

## 🔐 Credentials & Default Accounts

### Administrator Account
- **Email**: `admin@nexus.com`
- **Password**: `Admin@Secure2025`
- **Admin Security Passcode**: `ADM-SECURE-9481`

### Verified Demo Customer Account
- **Email**: `customer@nexus.com`
- **Password**: `Customer@123`

---

## 🗄️ Database Architecture (Supabase Cloud PostgreSQL)
- **Host**: `db.mkzdyspejdfeikilscgt.supabase.co:5432`
- **Database**: `postgres`
- **Tables**: `users`, `products` (252 items), `product_reviews`, `orders`, `order_items`, `payments`, `shipments`, `cart_items`, `addresses`
- **Security**: All customer passwords are encrypted using `bcrypt` (10 rounds salt).
