# Elucidate Architecture Restructuring - Session Handoff

**Date:** November 15, 2025
**Status:** Phase 1 Complete (Shared packages published) - Phase 2 Next (Restructure chess repo)

---

## What We Just Completed ✅

### Phase 1: Created & Published Shared Packages Repository

1. **Created `elucidate-shared` repository**
   - Location: `/Users/chandlerhardy/repos/elucidate-shared`
   - GitHub: https://github.com/ChandlerHardy/elucidate-shared
   - All packages published to npm successfully

2. **Published npm packages** (all public, under `@chandler-0411` scope):
   - `@chandler-0411/elucidate-typescript-config@1.0.0`
   - `@chandler-0411/elucidate-eslint-config@1.0.0`
   - `@chandler-0411/elucidate-tailwind-config@1.0.0`
   - `@chandler-0411/elucidate-ui@0.1.0` (empty placeholder)

---

## Current Architecture Decision

**Selected: Hybrid Polyrepo Architecture**

Based on user preferences:
- ✅ Loosely coupled portfolio (products are independent)
- ✅ Usually independent deployment (different release cadences)
- ✅ Solo developer (full context, no team coordination issues)
- ✅ Significant code sharing (UI, auth, AI engine, configs)

**Final Structure:**
```
# Shared packages (DONE ✅)
elucidate-shared/
├── packages/
│   ├── ui/
│   ├── typescript-config/
│   ├── eslint-config/
│   └── tailwind-config/

# Product repos (NEXT STEP ⏭️)
elucidate-chess/
├── apps/
│   ├── web/           # Next.js (renamed from chess-web)
│   └── api/           # FastAPI (renamed from chess-api)

# Future products
elucidate-code/
elucidate-finance/
```

---

## What Needs to Happen Next 🚧

### Phase 2: Restructure Chess Product Repo

The original `elucidate` monorepo (wherever it currently is) needs to be transformed into `elucidate-chess`.

#### Step 1: Find and Rename the Original Repo
```bash
# Find the original repo (it should be in /Users/chandlerhardy/repos/)
cd /Users/chandlerhardy/repos/
ls -la

# Look for either:
# - elucidate/
# - elucidate-chess/  (it might already have the right name)
# - or some other name

# Rename it to elucidate-chess if needed
mv elucidate elucidate-chess  # (adjust names as needed)
cd elucidate-chess
```

#### Step 2: Remove Old Packages Directory
The packages are now in `elucidate-shared`, so remove them from the chess repo:

```bash
cd /Users/chandlerhardy/repos/elucidate-chess
rm -rf packages/
git add -A
git commit -m "Remove packages - now in elucidate-shared repo"
```

#### Step 3: Update Chess Frontend Dependencies

File: `apps/chess-web/package.json`

**Change FROM:**
```json
"devDependencies": {
  "@elucidate/eslint-config": "workspace:*",
  "@elucidate/typescript-config": "workspace:*",
  "@elucidate/tailwind-config": "workspace:*"
}
```

**Change TO:**
```json
"devDependencies": {
  "@chandler-0411/elucidate-eslint-config": "^1.0.0",
  "@chandler-0411/elucidate-typescript-config": "^1.0.0",
  "@chandler-0411/elucidate-tailwind-config": "^1.0.0"
}
```

Then run:
```bash
cd apps/chess-web
pnpm install
```

#### Step 4: Flatten App Structure

**Rename directories:**
```bash
cd /Users/chandlerhardy/repos/elucidate-chess
mv apps/chess-web apps/web
mv apps/chess-api apps/api
```

**Update `pnpm-workspace.yaml`:**
```yaml
packages:
  - "apps/*"
```
(No change needed - `apps/*` still works)

**Update environment files:**
- Update paths in `docker-compose.dev.yml` if needed
- Update any scripts that reference old paths

#### Step 5: Update Configuration Files

**Update `.gitignore`** (add if not present):
```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Python
venv/
__pycache__/
*.pyc

# Build outputs
.turbo/
.next/
dist/

# Environment
.env
.env*.local

# Database
postgres_dev_data/

# Logs
*.log

# OS
.DS_Store
```

**Update `README.md`** to reflect new structure:
- Repo is now `elucidate-chess` (one product)
- Uses published packages from `@chandler-0411/elucidate-*`
- Apps are at `apps/web` and `apps/api`

#### Step 6: Create/Update GitHub Repository

If the GitHub repo still has the old name:
```bash
# Update remote URL (adjust username if needed)
git remote set-url origin https://github.com/ChandlerHardy/elucidate-chess.git

# Or create new repo on GitHub and push
# Then:
git push -u origin main
```

#### Step 7: Commit All Changes
```bash
git add -A
git commit -m "Restructure to elucidate-chess product repo

- Remove packages/ (moved to elucidate-shared)
- Update dependencies to use published @chandler-0411/* packages
- Rename apps/chess-web -> apps/web
- Rename apps/chess-api -> apps/api
- Update all configuration for new structure"

git push
```

---

## Phase 3: Continue Original Setup Tasks

After restructuring is complete, continue with the **original setup tasks** from `SETUP_STATUS.md`:

### Step 1: Create Initial Database Migration
```bash
cd /Users/chandlerhardy/repos/elucidate-chess/apps/api
source venv/bin/activate
alembic revision --autogenerate -m "Initial schema with User, Game, Position, Concept tables"
```

### Step 2: Run Migrations
```bash
# Still in apps/api with venv activated
alembic upgrade head
```

### Step 3: Test Backend
```bash
# Terminal 1: Start backend
cd /Users/chandlerhardy/repos/elucidate-chess/apps/api
source venv/bin/activate
uvicorn app.main:app --reload --port 8002
```

Visit:
- Backend: http://localhost:8002/chess/health
- GraphQL Playground: http://localhost:8002/chess/graphql

### Step 4: Test Frontend
```bash
# Terminal 2: Start frontend
cd /Users/chandlerhardy/repos/elucidate-chess/apps/web
pnpm dev
```

Visit: http://localhost:3000

---

## Quick Reference

### Repository Locations

```
/Users/chandlerhardy/repos/
├── elucidate-shared/     ← Shared packages (✅ DONE)
└── elucidate-chess/      ← Chess product (⏭️ NEXT)
    ├── apps/
    │   ├── web/          ← Next.js frontend
    │   └── api/          ← FastAPI backend
    ├── turbo.json
    ├── pnpm-workspace.yaml
    ├── docker-compose.dev.yml
    └── ...
```

### Published Packages (npm)

- View on npm: https://www.npmjs.com/~chandler-0411
- `@chandler-0411/elucidate-typescript-config@1.0.0`
- `@chandler-0411/elucidate-eslint-config@1.0.0`
- `@chandler-0411/elucidate-tailwind-config@1.0.0`
- `@chandler-0411/elucidate-ui@0.1.0`

### Database Info

PostgreSQL running in Docker:
- Container: `elucidate-chess-dev-db`
- Port: `5435`
- Database: `elucidate_chess_dev`
- User: `chess_dev_user`
- Password: `chess_dev_password`

**Start database:**
```bash
cd /Users/chandlerhardy/repos/elucidate-chess
docker-compose -f docker-compose.dev.yml up -d
```

---

## Documentation Files

- **Project Vision:** `ELUCIDATE_VISION.md` (in chess repo)
- **Chess Product Spec:** `CHESS_TRAINER_PROJECT.md` (in chess repo)
- **Original Setup Status:** `SETUP_STATUS.md` (in chess repo)
- **This Handoff:** `RESTRUCTURING_HANDOFF.md` (you're reading it!)

---

## Key Decisions Made

1. **Monorepo vs Polyrepo:** Chose hybrid polyrepo architecture
   - Separate repos per product (chess, code, finance)
   - Shared packages published to npm
   - Independent deployment, loosely coupled

2. **Package Scope:** Using `@chandler-0411/*` (your npm username)
   - Could create `@elucidate` org later if desired (costs $)
   - Public packages for now (can make private with GitHub Packages)

3. **Versioning:** Using Changesets for shared packages
   - Semantic versioning
   - Products update shared packages when ready

---

## Next Session Action Items

When you start the new Claude Code session in the chess repo:

1. [ ] Navigate to chess repo (find it first: `ls /Users/chandlerhardy/repos/`)
2. [ ] Rename to `elucidate-chess` if needed
3. [ ] Remove `packages/` directory
4. [ ] Update `apps/chess-web/package.json` dependencies
5. [ ] Run `pnpm install` in chess-web
6. [ ] Rename `apps/chess-web` → `apps/web`
7. [ ] Rename `apps/chess-api` → `apps/api`
8. [ ] Commit restructuring changes
9. [ ] Continue with migrations (Step 1 from Phase 3 above)
10. [ ] Test backend and frontend

---

## Questions or Issues?

If you run into problems:
- Check that PostgreSQL is running: `docker ps`
- Verify npm packages are published: Visit https://www.npmjs.com/~chandler-0411
- Ensure you're in the right directory
- Check git status: `git status`

---

**Good luck with Phase 2! The hard part (publishing packages) is done. Now it's just cleanup and testing.** 🚀
