# LIV8 GHL Backend

Secure multi-tenant backend for LIV8 GHL Operator and Setup OS.

## Features

- 🔒 Encrypted GHL token storage (no tokens on client)
- 🏢 Multi-tenant architecture (Agency → Location → User)
- 🔑 JWT authentication
- 📊 Complete audit logging
- 🤖 HighLevel MCP integration
- ✅ Strict schema validation (Zod)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Update with your values:
- `POSTGRES_URL`: Your Vercel Postgres connection string
- `JWT_SECRET`: Random secret for JWT signing
- `GHL_TEST_TOKEN`: Your GHL PIT token (for testing)
- `HIGHLEVEL_MCP_URL`: https://services.leadconnectorhq.com/mcp/

### 3. Initialize Database

Run the schema migration:

```bash
psql $POSTGRES_URL < src/db/schema.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### Authentication

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "agencyName": "My Agency"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**POST /api/auth/connect-location**
```json
{
  "locationId": "ghl-location-id",
  "locationName": "Location Name",
  "ghlToken": "pit-..."
}
```
*Requires: `Authorization: Bearer <JWT>`*

**GET /api/auth/me**

Get current user and locations.
*Requires: `Authorization: Bearer <JWT>`*

### Operator

**POST /api/operator/execute-plan**
```json
{
  "plan": { /* ActionPlan object */ },
  "context": { /* PageContext object */ }
}
```
*Requires: `Authorization: Bearer <JWT>`*

**GET /api/operator/audit-log?limit=100**

Get audit log for agency.
*Requires: `Authorization: Bearer <JWT>`*

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - POSTGRES_URL
# - JWT_SECRET
# - HIGHLEVEL_MCP_URL
```

## Security

- GHL tokens encrypted with AES-256-GCM
- JWT for session management (7-day expiry)
- CORS restricted to extension and dashboard origins
- All actions logged to audit trail
- Multi-tenant data isolation

## Testing

```bash
npm test
```

## Project Structure

```
backend/
├── src/
│   ├── api/          # API routes
│   │   ├── auth.ts   # Authentication endpoints
│   │   └── operator.ts # Operator execution
│   ├── services/     # Business logic
│   │   ├── auth.ts   # Auth service
│   │   └── mcp-client.ts # HighLevel MCP client
│   ├── db/           # Database
│   │   ├── schema.sql # PostgreSQL schema
│   │   └── index.ts  # DB queries & encryption
│   ├── lib/          # Shared utilities
│   │   └── schemas.ts # Zod validation schemas
│   └── index.ts      # Express server
├── package.json
├── tsconfig.json
└── vercel.json
```
