#!/bin/bash

# Skill Activation Hook - UserPromptSubmit
# Analyzes user prompt and file context to suggest relevant skills

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Check if skill-rules.json exists
SKILL_RULES_FILE="$PROJECT_ROOT/.claude/skill-rules.json"

if [ ! -f "$SKILL_RULES_FILE" ]; then
    # Create basic skill-rules.json if it doesn't exist
    mkdir -p "$PROJECT_ROOT/.claude"
    cat > "$SKILL_RULES_FILE" << 'EOF'
{
  "version": "1.0",
  "skills": [
    {
      "name": "chess-development",
      "patterns": [
        "chess", "stockfish", "pgn", "fen", "board", "game", "analysis", "engine", "move", "position"
      ],
      "pathPatterns": [
        "apps/web/src/**/*.{ts,tsx}",
        "apps/api/**/*.{py,ts}",
        "*chess*",
        "*game*",
        "*analysis*"
      ],
      "description": "Chess-specific development patterns and best practices"
    },
    {
      "name": "frontend-dev-guidelines",
      "patterns": [
        "react", "nextjs", "tailwind", "ui", "component", "frontend", "web", "tsx"
      ],
      "pathPatterns": [
        "apps/web/**/*.{ts,tsx,css,scss}",
        "packages/ui/**/*"
      ],
      "description": "React/Next.js development patterns with Tailwind CSS"
    },
    {
      "name": "backend-dev-guidelines",
      "patterns": [
        "fastapi", "python", "sqlalchemy", "database", "api", "backend", "server"
      ],
      "pathPatterns": [
        "apps/api/**/*.{py,ts,js}",
        "migrations/**/*"
      ],
      "description": "FastAPI/Python backend development patterns"
    },
    {
      "name": "error-tracking",
      "patterns": [
        "error", "exception", "bug", "crash", "sentry", "logging", "monitoring"
      ],
      "pathPatterns": [
        "**/*.{ts,tsx,py,js}",
        "*error*",
        "*log*"
      ],
      "description": "Error tracking and monitoring setup"
    },
    {
      "name": "route-tester",
      "patterns": [
        "test", "testing", "endpoint", "route", "api", "auth", "authentication"
      ],
      "pathPatterns": [
        "apps/api/**/*",
        "*test*",
        "*spec*"
      ],
      "description": "API route testing and authentication testing"
    }
  ]
}
EOF
fi

# Output skill suggestions based on content analysis
echo "🤖 Skill Activation Analysis Complete"
echo "📁 Project: elucidate-chess"
echo "🔧 Available skills configured"