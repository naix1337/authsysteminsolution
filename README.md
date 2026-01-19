# Auth System - Full-Stack Forum & Authentication

Production-ready authentication and forum system with C++ loader integration.

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### 1. Start Database Services

```bash
docker-compose up -d postgres redis
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Optional: Seed data
npm run seed
```

### 4. Start Backend

```bash
npm run start:dev
```

Backend will be available at `http://localhost:3001`
API Documentation at `http://localhost:3001/api/docs`

### 5. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 6. Start Frontend

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Project Structure

```
auth-system/
├── backend/              # NestJS Backend
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── loader/      # C++ Loader integration
│   │   ├── licensing/   # License management
│   │   ├── forum/       # Forum features
│   │   ├── admin/       # Admin panel API
│   │   ├── crypto/      # Cryptography utilities
│   │   ├── security/    # Security middleware
│   │   └── permissions/ # RBAC/ABAC
│   └── prisma/
│       └── schema.prisma
├── frontend/            # Next.js Frontend
│   └── src/
│       ├── app/         # App router
│       ├── components/  # Reusable components
│       └── features/    # Feature modules
├── cpp-loader/          # C++ Loader Client
│   ├── include/
│   └── src/
└── docs/                # Documentation
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/authsystem"
REDIS_HOST=localhost
JWT_SECRET=your-secret-key
```

## Features

✅ **Authentication**
- JWT + Refresh Tokens
- Device Fingerprinting
- Session Management
- Multi-factor Security

✅ **License System**
- Trial, Subscription, Lifetime
- Device Binding
- HWID Tracking
- Activation Management

✅ **Forum**
- Categories, Threads, Posts
- Markdown Support
- File Uploads
- Direct Messages
- RBAC/ABAC Permissions
- Soft-Deletes

✅ **Security**
- Payload Encryption (additional to HTTPS)
- Session Binding (Device + IP + Time)
- Anti-Replay Protection
- Rate Limiting
- Audit Logging

✅ **C++ Loader Integration**
- Secure Handshake Protocol
- Anti-Debugging
- Anti-VM Detection
- Memory Integrity Checks
- Binary Validation

## Documentation

- [API Documentation](http://localhost:3001/api/docs)
- [Implementation Plan](./docs/implementation_plan.md)
- [Security Architecture](./docs/security-architecture.md)
- [C++ Integration Guide](./docs/cpp-integration.md)

## License

MIT
