# Local Development Environment Setup

This guide explains how to set up your local development environment for Elucidate Chess, following the proven crooked-finger pattern.

## Quick Setup

1. **Copy environment templates:**
   ```bash
   # Root level environment variables (already created)
   # Edit .env with your local development settings
   nano .env
   ```

2. **Frontend environment variables:**
   ```bash
   # Frontend env file (already created)
   # Edit apps/web/.env.local if needed
   nano apps/web/.env.local
   ```

## Environment File Structure

```
elucidate-chess/
├── .env                           # Local development (DON'T COMMIT)
├── apps/api/
│   ├── .env.example              # Backend template
│   └── .env.production           # Production template (COMMIT)
└── apps/web/
    └── .env.local                # Frontend local (DON'T COMMIT)
```

## Required Environment Variables

### Backend (.env)
Add your API keys for local development:

```bash
# AI Services (Required for chess analysis)
GEMINI_API_KEY=your-gemini-api-key-here
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Security (Development keys are fine for local dev)
SECRET_KEY=local-development-secret-key
ADMIN_SECRET=local-admin-secret
```

### Frontend (.env.local)
No additional setup required - uses sensible defaults for local development.

## Database Setup

Local development uses PostgreSQL in Docker:

```bash
# Start development database
docker-compose -f docker-compose.dev.yml up -d

# Check if running
docker ps | grep elucidate-chess-dev-db
```

## Environment Variables Explained

### Backend Variables
- **DATABASE_URL**: PostgreSQL connection string (Docker-based)
- **SECRET_KEY/ADMIN_SECRET**: JWT authentication secrets
- **GEMINI_API_KEY**: Google Gemini AI for chess explanations
- **OPENROUTER_API_KEY**: Alternative AI service
- **CORS_ORIGINS**: Allowed frontend origins
- **ENVIRONMENT**: development/staging/production

### Frontend Variables (NEXT_PUBLIC_*)
- **NEXT_PUBLIC_GRAPHQL_URL**: Backend GraphQL endpoint
- **NEXT_PUBLIC_API_URL**: Backend REST API endpoint
- **NEXT_PUBLIC_*** prefix makes variables available in browser

## Security Notes

✅ **Safe to commit:**
- `.env.example` templates
- `.env.production` template

❌ **Never commit:**
- `.env` (local development secrets)
- `.env.local` (frontend local config)

## Testing Your Setup

1. **Backend health check:**
   ```bash
   cd apps/api
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8002

   # Test: curl http://localhost:8002/chess/health
   ```

2. **Frontend:**
   ```bash
   cd apps/web
   pnpm dev

   # Visit: http://localhost:3000
   ```

## Troubleshooting

### Backend won't start:
- Check PostgreSQL is running: `docker ps`
- Verify DATABASE_URL in `.env` matches Docker database
- Check Python venv is activated

### Frontend can't connect to backend:
- Verify NEXT_PUBLIC_GRAPHQL_URL in `.env.local`
- Check backend is running on port 8002
- Check CORS_ORIGINS includes your frontend URL

### Environment variables not loading:
- Ensure files are named correctly (`.env` not `.env.txt`)
- Check file permissions
- Verify you're in the right directory

## Pattern Benefits

Following the crooked-finger pattern gives you:
✅ **Consistent environment management**
✅ **Type-safe configuration (Pydantic)**
✅ **Clean separation of concerns**
✅ **Production-ready deployment**
✅ **Easy local development setup**