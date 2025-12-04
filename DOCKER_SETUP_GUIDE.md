# Complete Docker & Database Setup Guide

## 📦 Prerequisites Installed

Make sure you have:
- Docker Desktop installed (www.docker.com/products/docker-desktop)
- npm/Node.js installed (v18+)
- Git installed

---

## 🐳 Step 1: Docker Compose Setup

Create a **docker-compose.yml** file at the **ROOT of your project** (not inside backend or frontend):

```yaml
services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: research_postgres
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: research_db
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=en_US.UTF-8"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - research_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d research_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Redis Cache & Queue
  redis:
    image: redis:7-alpine
    container_name: research_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - research_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    command: redis-server --appendonly yes --requirepass ""
    restart: unless-stopped

  # Optional: pgAdmin for database management
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: research_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    networks:
      - research_network
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  research_network:
    driver: bridge
```

---

## 🚀 Step 2: Start All Services

```bash
# Navigate to project root (where docker-compose.yml is located)
cd /path/to/ai-research-assistant

# Start all services in background
docker-compose up -d

# View running containers
docker-compose ps

# Expected output:
# NAME              STATUS           PORTS
# research_postgres   Up (healthy)     0.0.0.0:5432->5432/tcp
# research_redis      Up (healthy)     0.0.0.0:6379->6379/tcp
# research_pgadmin    Up              0.0.0.0:5050->80/tcp

# View logs
docker-compose logs postgres
docker-compose logs redis

# Follow logs (live)
docker-compose logs -f postgres
```

---

## 🗄️ Step 3: Initialize PostgreSQL Database

```bash
cd backend

# Install Prisma tools
npm install prisma@5 @prisma/client@5  #using an older version of prisma in this project

# Generate Prisma client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# When prompted:
# ✔ Enter a name for the new migration: › init
# ✔ Prisma Migrate created the migration without errors and ran it in 2.34m

# Open Prisma Studio to verify
npx prisma studio

# Browser will open at: http://localhost:5555
# You should see tables: ResearchTask, Source, ResearchCache
```

### Verify Database Connection

```bash
# Test PostgreSQL directly
psql -U user -d research_db -h localhost -p 5433 -c "SELECT 1;"

# Expected:
# (1 row) [1]

# If psql not installed:
# - Mac: brew install postgresql
# - Windows: choco install postgresql (or use pgAdmin GUI)
# - Linux: apt-get install postgresql-client

# Or use Docker to test
docker exec research_postgres psql -U user -d research_db -c "SELECT 1;"
```

---

## 🔄 Step 4: Configure Redis

```bash
# Test Redis connection
redis-cli -h localhost ping # not installed, skip to next step

# Expected: PONG

# If redis-cli not installed:
# - Mac: brew install redis
# - Windows: Use Docker
docker exec research_redis redis-cli ping

# Check Redis info
docker exec research_redis redis-cli INFO

# Monitor Redis connections (live)
docker exec research_redis redis-cli MONITOR
```

---

## ⚙️ Step 5: Backend Environment Setup

Create **backend/.env** file:

```bash
cd backend

cat > .env << 'EOF'
# PostgreSQL Database (from docker-compose)
DATABASE_URL="postgresql://user:password@localhost:5432/research_db"

# API Keys (get from Phase 1)
GROQ_API_KEY=gsk_YOUR_ACTUAL_GROQ_KEY
TAVILY_API_KEY=tvly_YOUR_ACTUAL_TAVILY_KEY

# Server Configuration
PORT=3001
NODE_ENV=development

# Redis (from docker-compose)
REDIS_URL=redis://localhost:6379

# Frontend URL
FRONTEND_URL=http://localhost:3000
EOF

# Verify .env was created
cat .env
```

### Install Backend Dependencies

```bash
cd backend

# Install all dependencies
npm install

# Verify critical packages
npm list @nestjs/core @prisma/client bull redis

# Expected similar output:
# ├── @nestjs/core@10.x.x
# ├── @prisma/client@5.x.x
# ├── bull@4.x.x
# └── redis@4.x.x
```

---

## ⚙️ Step 6: Frontend Environment Setup

Create **frontend/.env.local** file:

```bash
cd frontend

cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
EOF

# Verify .env.local was created
cat .env.local
```

### Install Frontend Dependencies

```bash
cd frontend

# Install all dependencies
npm install

# Verify critical packages
npm list next axios socket.io-client

# Expected similar output:
# ├── next@14.x.x
# ├── axios@1.x.x
# └── socket.io-client@4.x.x
```

---

## ▶️ Step 7: Start Backend Server

Open **Terminal 1**:

```bash
cd backend

# Start development server with hot reload
npm run start:dev

# Expected output:
# [Nest] 12345  - 12/03/2024, 3:25:00 PM     LOG [NestFactory] Starting Nest application...
# [NestApplication] 3001  - 12/03/2024, 3:25:02 PM     LOG Application running on http://localhost:3001
# [NestApplication] 3001  - 12/03/2024, 3:25:02 PM     LOG [PrismaService] Database connected successfully
# [ResearchGateway] 3001 - 12/03/2024, 3:25:02 PM     LOG WebSocket server initialized
```

### Test Backend Health

Open **Terminal 2**:

```bash
# Health check
curl http://localhost:3001/health

# Expected: No response (endpoint not defined, but 404 means server is running)

# Better: Check if it accepts requests
Invoke-RestMethod -Uri "http://localhost:3001/api/research/start" -Method POST -ContentType "application/json" -Body '{"query": "What is AI?"}'

# Expected: Returns task ID (or error about missing Tavily key if not configured)
```

---

## ▶️ Step 8: Start Frontend Server

Open **Terminal 3**:

```bash
cd frontend

# Start Next.js development server
npm run dev

# Expected output:
# ▲ Next.js 14.x.x
#   - Local:        http://localhost:3000
#   - Environments: .env.local
# 
# ✓ Ready in 2.1s
```

### Test Frontend

Open **Terminal 4**:

```bash
# Test frontend is running
curl http://localhost:3000

# Open in browser
# http://localhost:3000

# You should see:
# - AI Research Assistant title
# - Search input box
# - Feature cards (Comprehensive Search, Intelligent Analysis, Professional Reports)
```

---

## 📋 Complete Startup Checklist

Use this checklist every time you start development:

```bash
# Terminal 1: Docker services
docker-compose up -d
sleep 5
docker-compose ps  # Verify all containers running

# Terminal 2: Verify databases
docker exec research_postgres psql -U user -d research_db -c "SELECT 1;"
docker exec research_redis redis-cli ping

# Terminal 3: Backend
cd backend
npm install (only first time)
npm run start:dev

# Terminal 4: Frontend
cd frontend
npm install (only first time)
npm run dev

# Open browser and test
# http://localhost:3000
```

---

## 🛑 Stopping Services

```bash
# Stop all services but keep data
docker-compose stop

# Stop and remove containers but keep volumes
docker-compose down

# Stop, remove containers AND delete all data
docker-compose down -v

# Stop individual service
docker-compose stop postgres
docker-compose stop redis

# Start again after stopping
docker-compose start
```

---

## 🔧 Troubleshooting Database Issues

### Issue: "PostgreSQL container won't start"

```bash
# Check logs
docker-compose logs postgres

# Fix: Port 5432 already in use
lsof -i :5432
kill -9 <PID>

# Or use different port in docker-compose:
# Change: "5432:5432" to "5433:5432"
# Then in .env: DATABASE_URL="postgresql://user:password@localhost:5433/research_db"

# Reset everything
docker-compose down -v
docker-compose up -d postgres
sleep 10
docker-compose logs postgres
```

### Issue: "Cannot connect to database"

```bash
# Check connection string
echo $DATABASE_URL

# Test connection manually
psql -U user -d research_db -h localhost -c "SELECT 1;"

# If password wrong:
docker-compose down -v
# Edit docker-compose.yml and change:
# POSTGRES_PASSWORD: newpassword
# Then update backend/.env:
# DATABASE_URL="postgresql://user:newpassword@localhost:5432/research_db"

docker-compose up -d postgres
```

### Issue: "Relations don't exist" or "No tables"

```bash
cd backend

# Check migrations
npx prisma migrate status

# If migrations not applied:
npx prisma migrate deploy

# Or reset and recreate
npx prisma migrate reset

# Seed with test data (optional)
npx prisma db seed
```

### Issue: "Cannot generate @prisma/client"

```bash
cd backend

# Clear cache
rm -rf node_modules/.prisma
rm -rf .prisma

# Reinstall
npm install @prisma/client
npx prisma generate

# Try again
npm run start:dev
```

---

## 🔧 Troubleshooting Redis Issues

### Issue: "Redis connection refused"

```bash
# Check if Redis is running
docker-compose ps redis

# If not running
docker-compose start redis

# Check logs
docker-compose logs redis

# Test connection
redis-cli -h localhost ping

# If no redis-cli:
docker exec research_redis redis-cli ping

# Monitor Redis
docker exec research_redis redis-cli MONITOR
```

### Issue: "Bull queue not processing"

```bash
# Check Redis is connected
docker exec research_redis redis-cli

# Then in Redis CLI
> info
> keys *  # Should see queue keys if jobs are queued

# Check job status
> KEYS bull:research:*
> HGETALL bull:research:1:data  # View job data

# Clear failed jobs (if needed)
> KEYS bull:research:*:failed:*
> DEL bull:research:1:failed:1
```

---

## 📊 Database Management

### Using pgAdmin GUI

1. Open http://localhost:5050
2. Login:
   - Email: admin@example.com
   - Password: admin

3. Add Server:
   - Right-click "Servers" → Register → Server
   - Name: research_db
   - Host: postgres (or research_postgres)
   - Port: 5432
   - Username: user
   - Password: password
   - Database: research_db

### Using Prisma Studio

```bash
cd backend
npx prisma studio

# Opens http://localhost:5555
# GUI for viewing and editing data
```

### Using Command Line

```bash
# Connect to database
psql -U user -d research_db -h localhost

# Common commands:
\dt              # List all tables
\d ResearchTask  # Describe table
SELECT * FROM ResearchTask;
SELECT COUNT(*) FROM Source;
DELETE FROM ResearchTask WHERE id = 'xxx';
\q              # Quit
```

---

## 🧹 Cleaning Up

### Remove stopped containers

```bash
docker-compose down
```

### Remove all project images and volumes

```bash
docker-compose down -v --remove-orphans
```

### Clean unused Docker resources

```bash
docker system prune
docker volume prune
docker network prune
```

---

## ✅ Verification Checklist

After everything is running, verify:

- [ ] Docker containers running: `docker-compose ps`
- [ ] PostgreSQL responding: `psql -U user -d research_db -h localhost -c "SELECT 1;"`
- [ ] Redis responding: `redis-cli ping`
- [ ] Backend running: `curl http://localhost:3001`
- [ ] Frontend running: `curl http://localhost:3000`
- [ ] Can access http://localhost:3000 in browser
- [ ] Prisma Studio opens: `npx prisma studio`
- [ ] pgAdmin accessible: http://localhost:5050

---

## 📝 Quick Reference Commands

```bash
# Docker
docker-compose up -d                    # Start all services
docker-compose down                     # Stop all services
docker-compose logs postgres            # View postgres logs
docker-compose logs -f redis            # Follow redis logs
docker-compose ps                       # Show container status

# Database
npx prisma generate                     # Generate client
npx prisma migrate dev --name <name>    # Create migration
npx prisma migrate deploy                # Apply migrations
npx prisma studio                       # Open GUI

# Testing
psql -U user -d research_db -h localhost -c "SELECT 1;"
redis-cli ping
curl http://localhost:3001
curl http://localhost:3000

# Backend
npm run start:dev                       # Start with hot reload
npm run build                          # Build for production

# Frontend
npm run dev                            # Start development
npm run build                          # Build for production
```

---

**Your database infrastructure is now ready!** 🎉

All services will automatically restart if your computer reboots (restart: unless-stopped).
