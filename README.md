# Elucidate Chess

AI-powered chess training platform with personalized learning paths and intelligent explanations.

## Project Structure

This is a Turborepo polyrepo containing:

```
elucidate-chess/
├── apps/
│   ├── web/                # Next.js 15 frontend (chess.elucidate.com)
│   └── api/                # FastAPI backend with GraphQL
├── docker-compose.dev.yml  # Local PostgreSQL database
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

**Shared packages** are now published separately:
- Repository: `elucidate-shared` (https://github.com/ChandlerHardy/elucidate-shared)
- Packages: `@chandler-0411/elucidate-*` on npm
- View: https://www.npmjs.com/~chandler-0411

## Tech Stack

### Frontend (apps/web)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Chess**: chess.js + react-chessboard
- **Animations**: Motion (Framer Motion)
- **UI Components**: shadcn/ui (Radix UI)
- **GraphQL Client**: Apollo Client
- **Theme**: next-themes

### Backend (apps/api)
- **Framework**: FastAPI
- **GraphQL**: Strawberry GraphQL
- **Database**: PostgreSQL + SQLAlchemy
- **Migrations**: Alembic
- **Auth**: JWT (python-jose + argon2)
- **Chess Engine**: Stockfish + python-chess
- **AI**: Google Gemini (with OpenRouter planned)

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- Python 3.11+
- Docker (for PostgreSQL)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd elucidate-chess
```

2. **Install frontend dependencies**
```bash
pnpm install
```

3. **Set up backend**
```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. **Start PostgreSQL**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. **Configure environment variables**

Frontend (`apps/web/.env.local`):
```bash
cp apps/web/.env.local.example apps/web/.env.local
# Edit with your values
```

Backend (`apps/api/.env`):
```bash
cp apps/api/.env.example apps/api/.env
# Add your API keys
```

6. **Run database migrations**
```bash
cd apps/api
alembic upgrade head
```

### Development

Start all services:

```bash
# Terminal 1: Frontend + all apps
pnpm dev

# Terminal 2: Backend API
cd apps/api
source venv/bin/activate
uvicorn app.main:app --reload --port 8002
```

Access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8002
- **GraphQL Playground**: http://localhost:8002/chess/graphql
- **PostgreSQL**: localhost:5435

### Building

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter web build
```

## Database

### Models
- **User**: Authentication, rating, subscription
- **Game**: Chess games with PGN notation
- **Position**: Individual positions with Stockfish analysis
- **Concept**: Chess concepts (pins, forks, etc.)
- **ConceptProgress**: User learning progress
- **ExplanationCache**: Cached AI explanations

### Migrations

Create new migration:
```bash
cd apps/api
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Deployment

### Frontend (Vercel)
- Push to main branch → automatic deployment
- Domain: chess.elucidate.com
- Set environment variables in Vercel dashboard

### Backend (Oracle Cloud / Railway)
```bash
cd apps/api
docker build -t elucidate-chess-api .
docker run -p 8002:8002 elucidate-chess-api
```

## Project Vision

See [ELUCIDATE_VISION.md](./ELUCIDATE_VISION.md) for the complete company vision.

See [CHESS_TRAINER_PROJECT.md](./CHESS_TRAINER_PROJECT.md) for detailed project specifications.

## Features (Planned)

### MVP
- [ ] User authentication (register, login, JWT)
- [ ] Game import (PGN paste, Lichess/Chess.com URL)
- [ ] Interactive chess board
- [ ] Stockfish position analysis
- [ ] AI-powered explanations (Gemini)
- [ ] Rating-based explanation complexity
- [ ] Concept detection and tracking
- [ ] Learning progress dashboard

### Phase 2
- [ ] Interactive quizzes
- [ ] Spaced repetition practice
- [ ] Custom puzzle generation
- [ ] Opening repertoire builder

### Phase 3
- [ ] Social features (sharing, study groups)
- [ ] Mobile app (iOS)
- [ ] Offline analysis

## Contributing

This is a personal project, but feedback is welcome!

## License

Proprietary - All rights reserved

---

**Elucidate** - Make the complex clear.
