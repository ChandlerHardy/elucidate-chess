# Claude Code Skills System

This document describes the advanced Claude Code skills system configured for the Elucidate Chess project.

## Overview

The skills system provides intelligent development assistance through:
- **Automatic skill suggestions** based on prompt analysis
- **Context-aware recommendations** using project-specific patterns
- **Priority-based activation** for critical debugging workflows
- **Dual trigger system** with keyword and intent pattern matching

## Hook System

### UserPromptSubmit Hook

**Location**: `.claude/hooks/skill-activation-prompt.sh`

**Function**: Analyzes incoming user prompts and suggests relevant skills before any development work begins.

**Behavior**:
1. Reads the user's prompt from stdin
2. Matches against configured skill patterns in `.claude/skill-rules.json`
3. Suggests up to 3 most relevant skills based on priority
4. Shows current git context for additional relevance
5. Provides usage instructions for suggested skills

## Skill Configuration

### skill-rules.json Structure

```json
{
  "version": "1.0.0",
  "skills": {
    "skill-name": {
      "type": "domain|testing|observability",
      "enforcement": "suggest|warn|block",
      "priority": "critical|high|medium|low",
      "description": "Human-readable skill description",
      "promptTriggers": {
        "keywords": ["error", "exception", "bug", "crash"],
        "intentPatterns": ["track.*error", "debug.*issue", "handle.*exception"]
      },
      "fileTriggers": {
        "patterns": ["apps/api/**/*.py", "**/*error*"],
        "contentSignatures": ["try\\s*{", "catch\\s*\\(", "Error|Exception"]
      }
    }
  }
}
```

## Available Skills

### 1. systematic-debugging
**Priority**: critical
**Type**: observability
**Description**: Four-phase debugging methodology for systematic bug investigation

**Triggers**:
- Keywords: `error`, `exception`, `bug`, `crash`, `sentry`, `logging`, `monitoring`, `debug`, `trace`
- Intent patterns: `track.*error`, `monitor.*performance`, `setup.*logging`, `handle.*exception`, `debug.*issue`
- File signatures: `try\s*{`, `catch\s*\(`, `console\.error`, `logging\.`, `Error|Exception`

**Usage**:
```bash
Skill(skill: "systematic-debugging")
```

### 2. error-tracking
**Priority**: critical
**Type**: observability
**Description**: Error tracking and monitoring setup for production applications

**Triggers**: Same as systematic-debugging (critical priority debugging)

**Usage**:
```bash
Skill(skill: "error-tracking")
```

### 3. chess-development
**Priority**: high
**Type**: domain
**Description**: Chess-specific development patterns and best practices

**Triggers**:
- Keywords: `chess`, `stockfish`, `pgn`, `fen`, `board`, `game`, `analysis`, `engine`, `move`, `position`
- Intent patterns: `implement.*chess`, `create.*game.*logic`, `add.*chess.*engine`, `parse.*pgn`
- File patterns: `apps/web/src/**/*.{ts,tsx}`, `apps/api/**/*.{py,ts}`, `*chess*`, `*game*`
- Content signatures: `stockfish`, `pgn.*parse`, `fen.*format`, `chess.*board`

### 4. frontend-dev-guidelines
**Priority**: high
**Type**: domain
**Description**: React/Next.js development patterns with Tailwind CSS

**Triggers**:
- Keywords: `react`, `nextjs`, `tailwind`, `ui`, `component`, `frontend`, `web`, `tsx`
- Intent patterns: `create.*component`, `implement.*react`, `setup.*tailwind`, `build.*ui`

### 5. fastapi-development
**Priority**: high
**Type**: domain
**Description**: FastAPI/Python backend development patterns

**Triggers**:
- Keywords: `fastapi`, `python`, `sqlalchemy`, `database`, `api`, `backend`, `server`
- Intent patterns: `create.*api`, `implement.*endpoint`, `setup.*fastapi`

### 6. route-tester
**Priority**: medium
**Type**: testing
**Description**: API route testing and authentication testing

**Triggers**:
- Keywords: `test`, `testing`, `endpoint`, `route`, `api`, `auth`, `authentication`
- Intent patterns: `test.*api`, `create.*test`, `setup.*auth.*test`

## Priority System

Skills are prioritized as follows:
1. **Critical** - Debugging and error handling (highest importance)
2. **High** - Domain-specific development patterns
3. **Medium** - Testing and workflows
4. **Low** - General utilities and helpers

## Usage Examples

### Automatic Activation
```bash
# These prompts automatically suggest relevant skills:

"I have a bug in my React component that is crashing"
→ Suggests: systematic-debugging, error-tracking

"Implement PGN parsing with Stockfish integration"
→ Suggests: chess-development

"Create FastAPI endpoints for user authentication"
→ Suggests: fastapi-development

"Set up comprehensive API testing for authentication routes"
→ Suggests: route-tester
```

### Manual Activation
```bash
# Use skills directly when needed:
Skill(skill: "systematic-debugging")
Skill(skill: "chess-development")
Skill(skill: "error-tracking")
Skill(skill: "frontend-dev-guidelines")
Skill(skill: "fastapi-development")
Skill(skill: "route-tester")
```

## Integration with Development Workflow

### Git Context Awareness
The hook automatically detects:
- Currently modified files (`git diff --cached --name-only`)
- Active working directory files
- Project context based on changed file patterns

### Development Environment
- **Frontend development**: Suggests React/Next.js skills when working in `apps/web/`
- **Backend development**: Suggests FastAPI/Python skills when working in `apps/api/`
- **Chess features**: Suggests chess development skills for chess-related files
- **Error scenarios**: Immediately suggests debugging skills for error-related content

## Configuration

### Adding New Skills
1. Edit `.claude/skill-rules.json`
2. Add new skill configuration following the structure above
3. Update UserPromptSubmit hook if needed for custom logic
4. Test with example prompts

### Modifying Triggers
- **Keyword triggers**: Add terms to `promptTriggers.keywords` array
- **Intent patterns**: Add regex patterns to `promptTriggers.intentPatterns` array
- **File patterns**: Add glob patterns to `fileTriggers.patterns` array
- **Content signatures**: Add regex patterns to `fileTriggers.contentSignatures` array

## Benefits

- **Intelligent assistance**: Context-aware skill suggestions
- **Reduced friction**: Automatic activation reduces manual skill selection
- **Debugging focus**: Critical debugging skills have highest priority
- **Domain expertise**: Chess-specific patterns for specialized development
- **Workflow integration**: Seamlessly integrates with existing development process

## Future Enhancements

- **Learning system**: Track skill usage patterns for better suggestions
- **Custom triggers**: User-specific skill preferences
- **Multi-skill combinations**: Suggest skill combinations for complex tasks
- **Performance optimization**: Faster pattern matching and caching