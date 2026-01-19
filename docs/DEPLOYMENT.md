# 🚀 Production Deployment Guide

## Prerequisites

- Linux Server (Ubuntu 20.04+ recommended)
- Docker & Docker Compose
- Domain name with SSL certificate
- Minimum 2GB RAM, 2 CPU cores
- 20GB disk space

---

## 1. Server Setup

### Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Install Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## 2. Clone & Configure

```bash
git clone <your-repo-url> /opt/auth-system
cd /opt/auth-system
```

### Environment Configuration

Update `.env` files:

**Backend (.env):**
```env
DATABASE_URL="postgresql://postgres:STRONG_PASSWORD@postgres:5432/authsystem"
REDIS_PASSWORD=STRONG_REDIS_PASSWORD
JWT_SECRET=GENERATE_STRONG_SECRET_KEY
JWT_REFRESH_SECRET=GENERATE_ANOTHER_STRONG_SECRET
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## 3. SSL Certificates

### Using Let's Encrypt (Recommended)

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com
```

Certificates will be in: `/etc/letsencrypt/live/yourdomain.com/`

---

## 4. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/auth-system`:

```nginx
# API Backend
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/auth-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 5. Build & Deploy

### Backend

```bash
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build
```

### Frontend

```bash
cd frontend
npm install
npm run build
```

---

## 6. Start Services

### Using Docker Compose (Recommended)

Update `docker-compose.yml` for production, then:

```bash
docker-compose up -d
```

### Using PM2 (Alternative)

```bash
npm install -g pm2

# Backend
cd backend
pm2 start dist/main.js --name auth-backend

# Frontend
cd frontend
pm2 start npm --name auth-frontend -- start

pm2 save
pm2 startup
```

---

## 7. Database Initialization

```bash
cd backend

# Run migrations
npx prisma migrate deploy

# Seed initial data (roles, categories)
npm run seed
```

---

## 8. Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# PostgreSQL & Redis should NOT be exposed
# They run in Docker network only
```

---

## 9. Monitoring & Logs

### View Logs

```bash
# Docker
docker-compose logs -f backend
docker-compose logs -f frontend

# PM2
pm2 logs
pm2 monit
```

### Health Checks

```bash
# API
curl https://api.yourdomain.com/api/health

# Frontend
curl https://yourdomain.com
```

---

## 10. Backup Strategy

### Database Backup

Create `/opt/backup-script.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker exec postgres pg_dump -U postgres authsystem > $BACKUP_DIR/db_$DATE.sql

# Backup Redis
docker exec redis redis-cli SAVE
docker cp redis:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /opt/backup-script.sh
```

---

## 11. Security Hardening

### Fail2Ban for API

Create `/etc/fail2ban/filter.d/auth-system.conf`:

```ini
[Definition]
failregex = ^.*"statusCode":401.*"ip":"<HOST>".*$
ignoreregex =
```

Create `/etc/fail2ban/jail.d/auth-system.conf`:

```ini
[auth-system]
enabled = true
port = 443
filter = auth-system
log path = /var/log/nginx/access.log
maxretry = 5
bantime = 3600
```

```bash
sudo systemctl restart fail2ban
```

### Database Security

- Use strong passwords
- Enable SSL for PostgreSQL connections
- Restrict network access (Docker network only)
- Regular security updates

---

## 12. Performance Optimization

### Enable Compression

In nginx config:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### Redis Caching

Already implemented in the backend.

### CDN Integration

Use Cloudflare or AWS CloudFront for:
- Static assets
- DDoS protection
- Global distribution

---

## 13. Maintenance

### Update Application

```bash
cd /opt/auth-system
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### Database Migrations

```bash
cd backend
npx prisma migrate deploy
```

### SSL Renewal

```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## 14. Troubleshooting

### Check All Services

```bash
docker-compose ps
systemctl status nginx
```

### Database Connection Issues

```bash
docker exec -it postgres psql -U postgres
\l  # List databases
\c authsystem  # Connect to database
\dt  # List tables
```

### Permission Issues

```bash
sudo chown -R $USER:$USER /opt/auth-system
```

---

## 15. Production Checklist

- [ ] Environment variables set (no defaults!)
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Database backups automated
- [ ] Monitoring set up
- [ ] Logs rotating
- [ ] Fail2Ban configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Error reporting (Sentry, etc.)
- [ ] Performance monitoring (New Relic, etc.)

---

## Support & Maintenance

- Monitor logs daily
- Check backups weekly
- Update dependencies monthly
- Review security advisories
- Performance audits quarterly

---

**Status**: Production-Ready Infrastructure ✅
