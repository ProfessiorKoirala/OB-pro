# Quick Setup Guide

## Prerequisites Installation

### Install Node.js
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Or download from https://nodejs.org/
```

### Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql@14
brew services start postgresql@14

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### Verify Installations
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
psql --version  # Should show PostgreSQL 12.x or higher
```

## Database Setup

### 1. Start PostgreSQL
```bash
# Linux
sudo systemctl start postgresql
sudo systemctl enable postgresql

# macOS
brew services start postgresql@14

# Windows
# PostgreSQL should auto-start as a service
```

### 2. Create Database User (Optional)
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create user (in psql prompt)
CREATE USER accounting_admin WITH PASSWORD 'your_secure_password';
ALTER USER accounting_admin CREATEDB;
\q
```

### 3. Create Database
```bash
# As postgres user
sudo -u postgres createdb accounting_db

# Or in psql
CREATE DATABASE accounting_db OWNER accounting_admin;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE accounting_db TO accounting_admin;
```

## Application Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd advanced-accounting-system
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file:
```env
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=accounting_db
DB_USER=accounting_admin
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Application Configuration
DEFAULT_CURRENCY=USD
TIMEZONE=UTC
LOG_LEVEL=info
```

### 3. Run Database Migrations
```bash
npm run migrate
```

Expected output:
```
Starting database migration...
Database migration completed successfully
```

### 4. Seed Initial Data
```bash
npm run seed
```

This will create:
- Default admin user (admin@example.com / admin123)
- Demo company
- Standard chart of accounts
- Sample currencies
- Default tax rates

### 5. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
Advanced Accounting System API running on port 3000
Server is running on http://localhost:3000
```

## Verify Installation

### 1. Check API Health
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-02-09T10:00:00.000Z"
}
```

### 2. Test Authentication
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Expected response:
```json
{
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Test API Endpoint
```bash
# Save the token from previous response
export TOKEN="your-jwt-token-here"

# Get chart of accounts
curl http://localhost:3000/api/accounts \
  -H "Authorization: Bearer $TOKEN"
```

## Common Issues and Solutions

### Issue: Cannot connect to PostgreSQL
**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Verify connection
psql -h localhost -U accounting_admin -d accounting_db
```

### Issue: Migration fails
**Solution:**
```bash
# Drop and recreate database
sudo -u postgres psql
DROP DATABASE accounting_db;
CREATE DATABASE accounting_db;
\q

# Run migration again
npm run migrate
```

### Issue: Port 3000 already in use
**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Issue: JWT token expired
**Solution:**
```bash
# Login again to get new token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

### Issue: Database connection timeout
**Solution:**
Edit `/etc/postgresql/*/main/postgresql.conf`:
```conf
max_connections = 100
shared_buffers = 256MB
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Next Steps

1. **Explore the API** - Check README.md for complete API documentation
2. **Create your first journal entry** - See examples in EXAMPLES.md
3. **Generate financial reports** - Try the reporting endpoints
4. **Customize chart of accounts** - Add accounts specific to your business
5. **Set up your organization** - Update organization details

## Development Tools

### Recommended VSCode Extensions
- PostgreSQL Explorer
- REST Client
- ESLint
- Prettier

### Useful Commands
```bash
# View logs
tail -f logs/combined.log

# Database backup
pg_dump -U accounting_admin accounting_db > backup.sql

# Database restore
psql -U accounting_admin accounting_db < backup.sql

# Run in watch mode
npm run dev

# Check database size
psql -U accounting_admin -d accounting_db -c "SELECT pg_size_pretty(pg_database_size('accounting_db'));"
```

## Production Deployment

For production deployment, see DEPLOYMENT.md

## Getting Help

- Check README.md for API documentation
- See EXAMPLES.md for usage examples
- Open an issue on GitHub for bugs
- Check logs in `logs/` directory
