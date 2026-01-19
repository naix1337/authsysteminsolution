# 🔐 Auth System - Full-Stack Forum & KeyAuth Integration

Production-ready authentication and forum system with C++ loader integration, designed for secure software licensing and community management.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![NestJS](https://img.shields.io/badge/NestJS-10.3-red)
![Next.js](https://img.shields.io/badge/Next.js-14.1-black)

## 🎯 Features

### 🔐 Authentication & Security
- **JWT Authentication** with refresh token rotation
- **Session Binding** to Device + IP + Timestamp
- **Multi-factor Security** with device fingerprinting
- **Payload Encryption** (AES-256-GCM on top of HTTPS)
- **Anti-Replay Protection** with nonce-based system
- **Rate Limiting** (Redis-backed)

### 🎫 License Management
- **Multiple License Types**: Trial, Subscription, Lifetime, One-Time
- **Device Binding** with configurable device limits
- **HWID Tracking** with tolerance for hardware changes
- **Activation Management** with automatic expiration
- **License Suspension** and shadow banning

### 🛡️ C++ Loader Integration
- **Secure Handshake** protocol (RSA-4096 key exchange)
- **Anti-Debugging** detection (IsDebuggerPresent, PEB checks)
- **Anti-VM/Sandbox** detection
- **Memory & Binary Integrity** validation
- **Self-Checksum** verification
- **Complete API Interface** with example code

### 💬 Forum System
- **Categories & Threads** with soft-delete support
- **RBAC/ABAC Permissions** (Role & Attribute-based access control)
- **Thread/Post-level Permissions**
- **Markdown Support** for rich text
- **Direct Messaging** between users
- **File Attachments** with size limits

### 👑 Admin Dashboard
- **User Management** (ban, HWID reset, session control)
- **License Management** (generate, revoke, view activations)
- **Security Monitoring** (audit logs, suspicious activity alerts)
- **Real-time Statistics**

---

## 🏗️ Tech Stack

### Backend
- **NestJS** (TypeScript)
- **PostgreSQL** (Database)
- **Redis** (Caching, Sessions, Rate Limiting)
- **Prisma** (ORM)
- **JWT** (Authentication)
- **OpenSSL** (Cryptography)

### Frontend
- **Next.js 14** (React with App Router)
- **TypeScript**
- **TailwindCSS** (Dark mode support)
- **Axios** (API Client)

### C++ Loader
- **CMake** (Build System)
- **OpenSSL** (libssl, libcrypto)
- **libcurl** (HTTP Client)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- **Option A: Docker** - Docker & Docker Compose
- **Option B: Local** - PostgreSQL 16+ & Redis 7+

---

### Option A: Mit Docker (Empfohlen)

### 1. Clone Repository
```bash
git clone https://github.com/naix1337/authsysteminsolution.git
cd authsysteminsolution
```

### 2. Start Database Services
```bash
docker-compose up -d postgres redis
```

### 3. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

**Backend runs on:** http://localhost:3001  
**API Docs:** http://localhost:3001/api/docs

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

**Frontend runs on:** http://localhost:3000

---

### Option B: Ohne Docker (Lokale Installation)

**📘 Siehe [SETUP-OHNE-DOCKER.md](SETUP-OHNE-DOCKER.md) für detaillierte Anleitung!**

**Kurzversion:**

1. Installiere PostgreSQL 16+ und Redis lokal
2. Erstelle Datenbank: `CREATE DATABASE authsystem;`
3. Konfiguriere `backend/.env` (siehe `.env.example`)
4. Backend: `npm install && npx prisma migrate dev && npm run start:dev`
5. Frontend: `npm install && npm run dev`

---

### C++ Loader (Optional)
```bash
git clone https://github.com/YOUR_USERNAME/auth-system.git
cd auth-system
```

### 2. Start Database Services
```bash
docker-compose up -d postgres redis
```

### 3. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

**Backend runs on:** http://localhost:3001  
**API Docs:** http://localhost:3001/api/docs

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

**Frontend runs on:** http://localhost:3000

### 5. C++ Loader (Optional)
```bash
cd cpp-loader
mkdir build && cd build
cmake ..
cmake --build . --config Release
```

---

## 📁 Project Structure

```
auth-system/
├── backend/              # NestJS Backend API
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── loader/      # C++ Loader API
│   │   ├── licensing/   # License management
│   │   ├── forum/       # Forum features
│   │   ├── admin/       # Admin panel
│   │   ├── crypto/      # Cryptography utilities
│   │   ├── security/    # Security middleware
│   │   └── permissions/ # RBAC/ABAC
│   └── prisma/
│       └── schema.prisma # Database schema (21 tables)
│
├── frontend/            # Next.js Frontend
│   └── src/
│       ├── app/         # App router pages
│       ├── components/  # Reusable components
│       └── features/    # Feature modules
│
├── cpp-loader/          # C++ Loader Client
│   ├── include/         # Header files
│   │   ├── protection.h     # Anti-debug/VM
│   │   └── auth_client.h    # API interface
│   ├── examples/        # Integration examples
│   └── CMakeLists.txt   # Build configuration
│
├── docs/                # Documentation
│   ├── DEPLOYMENT.md    # Production deployment guide
│   └── ...
│
└── docker-compose.yml   # PostgreSQL + Redis
```

---

## 📊 Database Schema

21 Tables including:
- **Users & Sessions** (JWT, Refresh Tokens)
- **Device Fingerprints** (HWID tracking)
- **Licenses & Activations** (License management)
- **Forum** (Categories, Threads, Posts, Likes)
- **Permissions** (Roles, RBAC/ABAC)
- **Security** (Audit Logs, IP Reputation, Security Events)
- **Admin** (Ban Records, Admin Actions)

See [`prisma/schema.prisma`](backend/prisma/schema.prisma) for complete schema.

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify` - Verify session

### C++ Loader
- `POST /api/loader/handshake` - Initial handshake
- `POST /api/loader/login` - Loader login
- `POST /api/loader/heartbeat` - Keep-alive heartbeat
- `GET /api/loader/ban-status/:id` - Check ban status

**Full API Documentation:** http://localhost:3001/api/docs (Swagger UI)

---

## 🔒 Security Features

### Cryptography
- **RSA-4096** for key exchange
- **AES-256-GCM** for payload encryption
- **HMAC-SHA256** for request signing
- **Bcrypt** for password hashing (cost factor: 12)

### Protection Mechanisms
- **Nonce-based Anti-Replay** (Redis store)
- **Timestamp Validation** (±5 minute window)
- **Session Binding** (Device + IP + Time)
- **Rate Limiting** (100 req/min per IP)
- **IP Reputation Scoring**
- **Geo-location Anomaly Detection**

### C++ Loader Protection
- **Anti-Debugging** (IsDebuggerPresent, PEB checks, timing attacks)
- **Anti-VM Detection** (CPUID, registry, process scanning)
- **Memory Integrity Checks**
- **Binary Hash Validation**
- **Self-Checksum Verification**

---

## 📚 Documentation

- [Implementation Plan](docs/implementation_plan.md) - Detailed technical plan
- [Security Architecture](docs/security-architecture.md) - Security diagrams & flows
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [Backend README](backend/README.md) - Backend documentation
- [Frontend README](frontend/README.md) - Frontend documentation
- [C++ Loader README](cpp-loader/README.md) - Loader integration guide

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend
npm run test

# Backend E2E tests
npm run test:e2e

# Frontend tests
cd frontend
npm run test
```

---

## 🚢 Production Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete production deployment guide including:
- Server setup (Ubuntu)
- SSL certificates (Let's Encrypt)
- Nginx reverse proxy
- Docker deployment
- Database backups
- Monitoring & logs
- Security hardening

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Frontend powered by [Next.js](https://nextjs.org/)
- UI styled with [TailwindCSS](https://tailwindcss.com/)
- Database managed with [Prisma](https://www.prisma.io/)

---

## 📧 Support

For support, email support@example.com or open an issue on GitHub.

---

## ⚠️ Disclaimer

This software is provided for educational purposes. Ensure compliance with all applicable laws and regulations when implementing licensing systems.

---

**Made with ❤️ by NAIX**
