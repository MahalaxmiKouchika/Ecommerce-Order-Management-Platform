<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:6366f1,100:06b6d4&height=220&section=header&text=Ecommerce%20Order%20Management%20Platform&fontSize=38&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Enterprise-grade%20%E2%80%A2%20Full-Stack%20%E2%80%A2%20Dual%20Backend&descAlignY=58&descSize=18" width="100%" alt="header"/>

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=6366F1&center=true&vCenter=true&width=700&lines=Browse+250%2B+products+in+a+blazing-fast+SPA;Secure+JWT+%2B+bcrypt+authentication;Real-time+order+tracking%3A+Placed+%E2%86%92+Shipped+%E2%86%92+Delivered;Powerful+Admin+Portal+for+global+operations;Node.js+%2B+Spring+Boot+sharing+one+database" alt="Typing SVG" />
</a>

<br/>

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

![Status](https://img.shields.io/badge/status-active-success?style=flat-square)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square)
![Java](https://img.shields.io/badge/java-17%2B-orange?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ff69b4?style=flat-square)

</div>

---

## 📑 Table of Contents

- [🌟 Project Overview](#-project-overview)
- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Repository Structure](#-repository-structure)
- [🔄 Workflow](#-workflow)
- [🚀 How to Run](#-how-to-run)
- [🔐 Demo Accounts](#-demo-accounts)
- [🔮 Future Improvements](#-future-improvements)
- [⚠️ Disclaimer](#️-disclaimer)
- [👩‍💻 Author](#-author)
- [🤝 Support](#-support)

---

## 🌟 Project Overview

**E-Commerce & Order Management Platform** is an enterprise-grade, high-performance system that covers the full shopping lifecycle: **discover → cart → checkout → track → review**, plus an exclusive **Administrator portal** for managing products, inventory and orders globally.

The platform follows a **full-stack monorepo** approach and ships with **two interchangeable backends** (Node.js/Express and Java/Spring Boot) that talk to the **same Supabase PostgreSQL database**, demonstrating clean API design and backend portability.

| 🎯 Goal | 💡 Solution |
|---|---|
| Fast, smooth shopping experience | React 18 + Vite SPA with instant HMR and utility-first Tailwind UI |
| Secure access | JWT stateless sessions, bcrypt hashing, role-based access (Admin / Customer) |
| Operational control | Admin dashboard for catalog, inventory and global order oversight |
| Trustworthy feedback | Reviews allowed only on **verified purchases** |
| High availability | In-memory fallback store when the cloud DB connection drops |

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🛍️ Customer Experience
- 🔎 **Product Catalog & Search** — 250+ seeded products with categories, ratings and rich descriptions
- 🛒 **Real-time Cart** — interactive cart management
- 💳 **Secure Checkout** — smooth order placement
- 📦 **Live Order Tracking** — `Placed → Shipped → Delivered`
- ⭐ **Verified Reviews** — only for products you've purchased

</td>
<td width="50%">

### 🛡️ Admin & Platform
- 👑 **Admin Portal** — add / edit products, manage inventory, oversee all orders
- 🔐 **RBAC Authentication** — JWT + bcrypt with Admin vs Customer roles
- 🗝️ **Extra Admin Security Key** at login
- 🌱 **Auto Seeding** — CSV parsing loads products on startup
- 🧯 **Resilient** — in-memory fallback database

</td>
</tr>
</table>

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph CLIENT["🖥️ Client — React 18 + TypeScript + Vite"]
        UI["Pages & Components<br/>Tailwind CSS v4 · Lucide Icons"]
        STATE["Cart & Auth State"]
    end

    subgraph API["⚙️ API Layer (choose one, same contract)"]
        direction LR
        NODE["🟢 Node.js Server<br/>Express + TypeScript<br/>tsx / esbuild"]
        JAVA["☕ Spring Boot 3 Server<br/>Controllers · Services<br/>Repositories · DTOs · Entities"]
    end

    subgraph SEC["🔒 Security"]
        JWT["JWT Sessions"]
        BC["bcrypt Hashing"]
        RBAC["Role Guards<br/>Admin / Customer"]
    end

    subgraph DATA["🗄️ Data Layer"]
        PG[("PostgreSQL<br/>Supabase Cloud")]
        MEM[("In-Memory<br/>Fallback Store")]
        CSV["📄 CSV Seed Data<br/>250+ products"]
    end

    UI --> STATE
    STATE -->|"REST / JSON"| NODE
    STATE -.->|"REST / JSON (alt)"| JAVA
    NODE --> SEC
    JAVA --> SEC
    NODE -->|"pg pool"| PG
    JAVA -->|"Spring Data JPA"| PG
    NODE -.->|"if DB unreachable"| MEM
    CSV -->|"seed on startup"| PG
```

### 🧩 Layered View

```mermaid
flowchart LR
    A["Presentation<br/>React SPA"] --> B["Routing & Middleware<br/>Auth · RBAC · Validation"]
    B --> C["Business Logic<br/>Cart · Orders · Reviews"]
    C --> D["Data Access<br/>pg pool / JPA"]
    D --> E[("Supabase<br/>PostgreSQL")]
```

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technologies |
|:---:|:---|
| **Frontend** | ![React](https://img.shields.io/badge/-React_18-20232A?logo=react&logoColor=61DAFB) ![TS](https://img.shields.io/badge/-TypeScript-007ACC?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) ![Tailwind](https://img.shields.io/badge/-Tailwind_v4-38B2AC?logo=tailwind-css&logoColor=white) ![Lucide](https://img.shields.io/badge/-Lucide_React-F56565?logo=lucide&logoColor=white) |
| **Backend (Primary)** | ![Node](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white) ![tsx](https://img.shields.io/badge/-tsx-3178C6?logo=typescript&logoColor=white) ![esbuild](https://img.shields.io/badge/-esbuild-FFCF00?logo=esbuild&logoColor=black) |
| **Backend (Companion)** | ![Java](https://img.shields.io/badge/-Java_17+-ED8B00?logo=openjdk&logoColor=white) ![Spring](https://img.shields.io/badge/-Spring_Boot_3-6DB33F?logo=springboot&logoColor=white) ![Maven](https://img.shields.io/badge/-Maven-C71A36?logo=apachemaven&logoColor=white) ![JPA](https://img.shields.io/badge/-Spring_Data_JPA-6DB33F?logo=spring&logoColor=white) |
| **Database** | ![Postgres](https://img.shields.io/badge/-PostgreSQL-316192?logo=postgresql&logoColor=white) ![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?logo=supabase&logoColor=white) |
| **Security** | ![JWT](https://img.shields.io/badge/-JWT-000000?logo=jsonwebtokens&logoColor=white) ![bcrypt](https://img.shields.io/badge/-bcrypt-003A70?logo=letsencrypt&logoColor=white) |
| **Tooling** | ![Git](https://img.shields.io/badge/-Git-F05032?logo=git&logoColor=white) ![npm](https://img.shields.io/badge/-npm-CB3837?logo=npm&logoColor=white) |

</div>

---

## 📂 Repository Structure

> 📝 *Adjust folder names below to match your actual repository if they differ.*

```text
Ecommerce-Order-Management-Platform/
│
├── 📁 src/                      # React + TypeScript frontend (Vite)
│   ├── 📁 components/           # Reusable UI components
│   ├── 📁 pages/                # Catalog, Cart, Checkout, Orders, Admin
│   ├── 📁 context/              # Auth & Cart state
│   ├── 📁 services/             # API client helpers
│   ├── 📄 App.tsx
│   └── 📄 main.tsx
│
├── 📁 server/                   # Node.js + Express backend (primary)
│   ├── 📁 routes/               # auth, products, cart, orders, reviews, admin
│   ├── 📁 middleware/           # JWT verification, role guards
│   ├── 📁 db/                   # pg pool, in-memory fallback, CSV seeding
│   └── 📄 server.ts
│
├── 📁 src/main/java/...         # Spring Boot backend (companion)
│   ├── 📁 controller/
│   ├── 📁 service/
│   ├── 📁 repository/
│   ├── 📁 dto/
│   └── 📁 entity/
│
├── 📁 data/                     # CSV seed data (250+ products)
├── 📄 .env.example              # Environment template
├── 📄 package.json
├── 📄 pom.xml                   # Maven config (Java backend)
├── 📄 mvnw / mvnw.cmd           # Maven wrapper
├── 📄 vite.config.ts
└── 📄 README.md
```

---

## 🔄 Workflow

### 🧭 Customer Journey

```mermaid
sequenceDiagram
    autonumber
    actor C as 👤 Customer
    participant UI as React SPA
    participant API as Express / Spring API
    participant DB as PostgreSQL (Supabase)

    C->>UI: Register / Login
    UI->>API: POST /auth/login
    API->>DB: Verify user (bcrypt compare)
    API-->>UI: JWT token
    C->>UI: Browse & search products
    UI->>API: GET /products
    API->>DB: Query catalog
    DB-->>UI: Products + ratings
    C->>UI: Add to cart → Checkout
    UI->>API: POST /orders (JWT)
    API->>DB: Create order (Placed)
    API-->>UI: Order confirmation
    Note over API,DB: Admin updates status
    API->>DB: Placed → Shipped → Delivered
    C->>UI: Track order & leave review
    UI->>API: POST /reviews (verified purchase only)
```

### 📦 Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Placed: Customer checks out
    Placed --> Shipped: Admin dispatches
    Shipped --> Delivered: Delivery confirmed
    Delivered --> Reviewed: Verified review unlocked
    Reviewed --> [*]
```

### 👑 Admin Flow

```mermaid
flowchart LR
    L["Login<br/>email + password + security key"] --> D["Admin Dashboard"]
    D --> P["Manage Products<br/>add · edit"]
    D --> I["Manage Inventory"]
    D --> O["Oversee Global Orders"]
    O --> S["Update Shipment Status"]
```

---

## 🚀 How to Run

### ✅ Prerequisites

- **Node.js** v18 or higher
- **Git**
- *Optional:* **Java 17+** (only for the Spring Boot backend)

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/MahalaxmiKouchika/Ecommerce-Order-Management-Platform.git
cd Ecommerce-Order-Management-Platform

# Install dependencies
npm install
```

### 2️⃣ Environment Setup

Create a `.env` file in the root directory (based on `.env.example`):

```env
DATABASE_URL=your_supabase_postgres_connection_string
JWT_SECRET=your_long_random_secret
# Add any additional Supabase keys required by .env.example
```

### 3️⃣ Run the Development Server (Node.js + React)

```bash
npm run dev
```

| Service | URL |
|---|---|
| 🌐 Frontend + API (same server) | `http://localhost:3000` |

> 💡 Keep the terminal running and open the link above to use the app.

### ☕ Alternative: Run the Java Spring Boot Backend

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Mac / Linux
./mvnw spring-boot:run
```

### 🏭 Production Build (optional)

```bash
npm run build     # bundles the frontend and server (Vite + esbuild)
npm start         # runs the production bundle
```

---

## 🔐 Demo Accounts

Use these pre-configured **demo** accounts to explore the platform:

<table>
<tr>
<th>Role</th><th>Email</th><th>Password</th><th>Extra</th>
</tr>
<tr>
<td>👑 Administrator</td>
<td><code>admin@nexus.com</code></td>
<td><code>Admin@Secure2025</code></td>
<td>Security Key: <code>ADM-SECURE-9481</code></td>
</tr>
<tr>
<td>🛍️ Verified Customer</td>
<td><code>customer@nexus.com</code></td>
<td><code>Customer@123</code></td>
<td>—</td>
</tr>
</table>

> 🚨 **Security note:** These credentials are for local demos only. Change or remove them, and rotate `JWT_SECRET`, before any real deployment.

---

## 🔮 Future Improvements

- [ ] 💳 Integrate real payment gateways (Stripe / Razorpay)
- [ ] 📧 Email & SMS notifications for order status changes
- [ ] 🔍 Advanced search with filters, sorting and full-text / fuzzy matching
- [ ] ❤️ Wishlist and product recommendations
- [ ] 📊 Admin analytics dashboard (sales, revenue, top products)
- [ ] 🧾 Invoice / PDF receipt generation
- [ ] 🔄 Returns, refunds and cancellation workflow
- [ ] 🎟️ Coupons, discounts and promotional campaigns
- [ ] 🐳 Docker & Docker Compose setup for one-command startup
- [ ] ⚙️ CI/CD pipeline with GitHub Actions (lint, test, deploy)
- [ ] 🧪 Unit, integration and end-to-end test coverage
- [ ] 🌍 Multi-language & multi-currency support
- [ ] 🔔 Real-time updates via WebSockets
- [ ] 🛡️ Rate limiting, refresh tokens, and 2FA for admins

---

## ⚠️ Disclaimer

This project is built for **educational and portfolio purposes**. Product data is seeded sample data, and no real payments or shipments are processed. The bundled demo credentials are intentionally public and must not be used in production. Use of this software is at your own risk.

---

## 👩‍💻 Author

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=1200&color=06B6D4&center=true&vCenter=true&width=420&lines=Mahalakshmi;B.Tech+CSE+%7C+Full-Stack+%26+ML+Enthusiast" alt="author typing"/>

[![GitHub](https://img.shields.io/badge/GitHub-MahalaxmiKouchika-181717?style=for-the-badge&logo=github)](https://github.com/MahalaxmiKouchika)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](www.linkedin.com/in/mahalaxmi-kouchika-308142372
)
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:mahalaxmikouchika2007@gmail.com@example.com)

</div>

---

## 🤝 Support

If you found this project helpful:

- ⭐ **Star** the repository
- 🍴 **Fork** it and build something new
- 🐛 Open an [issue](https://github.com/MahalaxmiKouchika/Ecommerce-Order-Management-Platform/issues) for bugs or feature requests
- 🔧 Submit a **pull request**, contributions are always welcome

<div align="center">

<br/>

**Made with ❤️ and lots of ☕ by Mahalakshmi**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:06b6d4,50:6366f1,100:0f172a&height=120&section=footer&animation=fadeIn" width="100%" alt="footer"/>

</div>
