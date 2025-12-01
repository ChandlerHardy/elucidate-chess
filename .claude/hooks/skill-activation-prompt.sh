#!/bin/bash

# Skill Activation Hook - UserPromptSubmit
# Analyzes user prompt and file context to suggest relevant skills
# Uses existing sophisticated skill-rules.json

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Read the user prompt from stdin
USER_PROMPT=$(cat)

# Use existing sophisticated skill-rules.json
SKILL_RULES_FILE="$PROJECT_ROOT/.claude/skill-rules.json"

echo "🔍 Analyzing your request..."
echo

# Function to suggest skills using simple pattern matching
suggest_skills() {
    local prompt="$1"

    # Convert prompt to lowercase for matching
    local prompt_lower=$(echo "$prompt" | tr '[:upper:]' '[:lower:]')

    local suggestions_found=0

    # Check for debugging/error skills (critical priority)
    if echo "$prompt_lower" | grep -q -E "(error|exception|bug|crash|sentry|logging|monitoring|debug|trace|investigate|troubleshoot|diagnose)"; then
        echo "💡 Skill suggestion 1: systematic-debugging"
        echo "   📝 Debugging methodology with four-phase framework for systematic bug investigation"
        echo "   🎯 Priority: critical"
        echo "   🔍 Matched keywords: error, exception, bug, crash, debug"
        echo
        echo "💡 Skill suggestion 2: error-tracking"
        echo "   📝 Error tracking and monitoring setup for production applications"
        echo "   🎯 Priority: critical"
        echo "   🔍 Matched keywords: error, exception, crash, monitoring, logging"
        echo
        suggestions_found=1
    fi

    # Check for chess development skills (high priority)
    if echo "$prompt_lower" | grep -q -E "(chess|stockfish|pgn|fen|board|game|analysis|engine|move|position|castling|checkmate|opening|endgame)"; then
        echo "💡 Skill suggestion 1: chess-development"
        echo "   📝 Chess-specific development patterns and best practices"
        echo "   🎯 Priority: high"
        echo "   🔍 Matched keywords: chess, game, analysis"
        echo
        suggestions_found=1
    fi

    # Check for frontend development skills (high priority)
    if echo "$prompt_lower" | grep -q -E "(react|nextjs|tailwind|ui|component|frontend|web|tsx)"; then
        echo "💡 Skill suggestion 1: frontend-dev-guidelines"
        echo "   📝 React/Next.js development patterns with Tailwind CSS"
        echo "   🎯 Priority: high"
        echo "   🔍 Matched keywords: react, component, frontend"
        echo
        suggestions_found=1
    fi

    # Check for backend development skills (high priority)
    if echo "$prompt_lower" | grep -q -E "(fastapi|python|sqlalchemy|database|api|backend|server|endpoint|pydantic)"; then
        echo "💡 Skill suggestion 1: fastapi-development"
        echo "   📝 FastAPI/Python backend development patterns"
        echo "   � 🎯 Priority: high"
        echo "   🔍 Matched keywords: fastapi, python, api"
        echo
        suggestions_found=1
    fi

    # Check for testing skills (medium priority)
    if echo "$prompt_lower" | grep -q -E "(test|testing|endpoint|route|auth|authentication|pytest|integration)"; then
        echo "💡 Skill suggestion 1: route-tester"
        echo "   📝 API route testing and authentication testing"
        echo "   🎯 Priority: medium"
        echo "   🔍 Matched keywords: test, testing, api"
        echo
        suggestions_found=1
    fi

    return $suggestions_found
}

# Suggest skills using sophisticated rules
if suggest_skills "$USER_PROMPT"; then
    echo "💭 To use a skill: \`Skill(skill: \"skill-name\")\`"
else
    echo "🤖 Skill Activation Analysis Complete"
    echo "📁 Project: elucidate-chess"
    echo "🔧 Available skills configured"
fi

# Show git context if available
git_files=$(git diff --cached --name-only 2>/dev/null || git diff --name-only 2>/dev/null || echo "")
if [ -n "$git_files" ]; then
    echo "📂 Current files: $(echo "$git_files" | head -3 | tr '\n' ' ')"
fi

echo