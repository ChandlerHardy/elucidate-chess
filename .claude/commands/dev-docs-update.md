# /dev-docs-update Command

**Purpose:** Update dev docs with session progress, unfinished work, and handoff notes before context reset or session end.

## Usage
```
/dev-docs-update
```

## What It Updates

### Session Progress
- Marks completed tasks in tasks.md
- Updates current work in context.md
- Adds new discoveries or blockers
- Captures decisions made during session

### Handoff Preparation
- Documents exactly where you left off
- Notes current file states
- Records work in progress
- Provides quick resume instructions

### Memory Preservation
- Saves key insights and decisions
- Documents architectural choices
- Captures troubleshooting steps
- Records solutions to problems

## When to Use

- Before ending development session
- When approaching context limits
- Before handing off to another session
- When switching to different task
- Before major context changes

## Example Output
The command scans your active dev docs and updates them with:

```markdown
## SESSION PROGRESS (2025-11-18 14:30)

### ✅ COMPLETED
- Implemented Stockfish engine integration
- Created FastAPI analysis endpoint
- Fixed chess board React component issues

### 🟡 IN PROGRESS
- Working on: AI explanation service (apps/api/app/services/ai_service.py)
- Current file: apps/api/app/endpoints/chess.py (line 45-52)
- Next step: Add Gemini API integration tests

### ⚠️ BLOCKERS
- Need to configure Gemini API key in production
- Database performance issues with large game tables
```

## Benefits

- **Zero knowledge loss** between sessions
- **Instant resume capability**
- **Context preservation** across resets
- **Collaboration ready** for team handoffs
- **Progress tracking** for complex projects

## Integration with Development Workflow

Use this command as part of your session wrap-up routine:

1. Complete current work block
2. Run `/dev-docs-update`
3. Verify updates are accurate
4. End session or switch tasks

This ensures your next session can resume exactly where you left off with full context.