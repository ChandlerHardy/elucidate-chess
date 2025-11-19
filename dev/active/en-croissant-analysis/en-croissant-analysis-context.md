# en-croissant Analysis - Context

**Date Created:** 2025-11-18
**Last Updated:** 2025-11-18

## Current Project Architecture

### What We ACTUALLY Have (Hybrid Polyrepo)

**Repository Structure:**
```
elucidate-chess/
├── apps/
│   ├── web/                # Next.js 15 frontend
│   └── api/                # FastAPI backend
├── dev/                    # Development docs (NEW!)
├── turbo.json             # Turborepo for task orchestration
├── pnpm-workspace.yaml    # pnpm workspace
└── Various config files
```

**Shared Packages (Published Separately):**
- Repository: `elucidate-shared`
- Packages: `@chandler-0411/elucidate-*` on npm
- Includes: eslint-config, typescript-config, tailwind-config, ui

**Technology Stack:**
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- Backend: FastAPI, Strawberry GraphQL, PostgreSQL, SQLAlchemy
- Chess: chess.js, react-chessboard, Stockfish, python-chess
- AI: Google Gemini API
- Deployment: Vercel (frontend) + OCI/Railway (backend)

## Business Vision

**Multi-Product Strategy:**
1. Elucidate Chess (Launch Product - Q1 2025)
2. Elucidate Code (Next Product - Q2/Q3 2025)
3. Elucidate Finance/Law/etc. (Future)

**Target Market:**
- Chess: 800-2000 ELO players, $5/month freemium
- Code: Developers + teams, $10-50/month
- Finance: Retail investors (future)

## en-croissant Repository

**URL:** https://github.com/franciscoBSalgueiro/en-croissant
**Description:** "The Ultimate Chess Toolkit"

**Initial Observations:**
- 1.1k stars, 171 forks (active community)
- TypeScript (86.6%) + Rust (13.0%)
- Tauri framework (cross-platform desktop app)
- Latest release: v0.11.1 (Sept 6, 2024)

**Key Features (from README):**
- Store and analyze games from Lichess/Chess.com
- Multi-engine analysis (UCI engines)
- Repertoire preparation with spaced repetition
- Engine and database management
- Position search in database

## Previous Confusion Points

**My Incorrect Assumptions:**
- Thought you had a monorepo (you have polyrepo)
- Thought you had @chandler-0411 packages in this repo (they're published separately)
- Thought you had Turborepo monorepo (you use it for task orchestration)
- Was working from outdated mental models

**Reality Check:**
- You have a professional hybrid polyrepo architecture
- Shared packages are properly published to npm
- Current structure is actually perfect for multi-product vision
- Documentation was scattered causing my confusion

## Current Development Status

**From SETUP_STATUS.md:**
- 95% complete setup
- Database models defined (User, Game, Position, Concept, etc.)
- GraphQL schema ready
- Docker environment configured
- Deployment scripts ready (OCI)
- **Need to:** Run migrations, test backend/frontend

## Analysis Goals

**Primary Question:** Fork en-croissant vs continue with current structure?

**Secondary Questions:**
- What chess features can we learn/adapt?
- How does en-croissant handle X vs our approach?
- What are the architectural tradeoffs?
- What specific implementation ideas should we adopt?