# Setup Package - Claude Code Skills System

This directory contains configuration examples and setup files for the Elucidate Chess project's Claude Code skills system.

## Files

### `skill-rules.json.example`
Example configuration for Claude Code skills system. This shows the complete structure for:

- **Domain-specific skills** (chess, frontend, backend development)
- **Debugging skills** (error tracking, systematic debugging)
- **Testing skills** (API route testing, authentication testing)
- **Priority-based activation** (critical, high, medium)
- **Dual trigger system** (prompt keywords + file content analysis)

## Installation

1. **Copy the example configuration**:
   ```bash
   cp setup-package/skill-rules.json.example .claude/skill-rules.json
   ```

2. **Configure for your project** by editing `.claude/skill-rules.json`

3. **Test the skills system**:
   ```bash
   echo "I have a bug in my React component" | CLAUDE_PROJECT_DIR=. .claude/hooks/skill-activation-prompt.sh
   ```

## Skill Configuration

### Priority Levels

- **`critical`** - Debugging and error handling (highest priority)
- **`high`** - Domain-specific development patterns
- **`medium`** - Testing and workflows
- **`low`** - General utilities and helpers

### Enforcement Levels

- **`suggest`** - Recommend skills to user
- **`warn`** - Strong recommendation for debugging scenarios
- **`block`** - Require skill usage (not implemented)

### Trigger Types

#### Prompt Triggers
- **`keywords`** - Direct term matching
- **`intentPatterns`** - Regex patterns for intent detection

#### File Triggers
- **`patterns`** - Glob patterns for file paths
- **`contentSignatures`** - Regex patterns for file content

## Available Skills

### 1. systematic-debugging
- **Priority**: critical
- **Use**: `Skill(skill: "systematic-debugging")`
- **Triggers**: error, exception, bug, crash, debug, investigate, troubleshoot
- **Best for**: Complex debugging scenarios, production issues

### 2. error-tracking
- **Priority**: critical
- **Use**: `Skill(skill: "error-tracking")`
- **Triggers**: error, exception, bug, crash, monitoring, logging
- **Best for**: Production monitoring, error handling setup

### 3. chess-development
- **Priority**: high
- **Use**: `Skill(skill: "chess-development")`
- **Triggers**: chess, stockfish, pgn, fen, board, game, analysis
- **Best for**: Chess feature development, PGN parsing, engine integration

### 4. frontend-dev-guidelines
- **Priority**: high
- **Use**: `Skill(skill: "frontend-dev-guidelines")`
- **Triggers**: react, nextjs, tailwind, ui, component, frontend
- **Best for**: React components, Next.js pages, UI development

### 5. fastapi-development
- **Priority**: high
- **Use**: `Skill(skill: "fastapi-development")`
- **Triggers**: fastapi, python, sqlalchemy, database, api, backend
- **Best for**: API endpoints, database models, FastAPI patterns

### 6. route-tester
- **Priority**: medium
- **Use**: `Skill(skill: "route-tester")`
- **Triggers**: test, testing, endpoint, route, api, auth
- **Best for**: API testing, authentication testing, integration tests

## UserPromptSubmit Hook

### Hook Location

**Project-Specific vs User-Specific Hooks**

Claude Code supports both project-specific and user-specific hooks:

| Location | Scope | When to Use | Example |
|----------|-------|-------------|--------|
| **`.claude/hooks/`** | Project-specific | ✅ **RECOMMENDED** - Chess development skills, team collaboration | `elucidate-chess/.claude/hooks/skill-activation-prompt.sh` |
| **`~/.claude/hooks/`** | User-specific | ❌ Not recommended - Global settings, no project context | `~/.claude/hooks/skill-activation-prompt.sh` |

**Your current setup uses the recommended project-specific location.**

### Installation

1. **Copy the example configuration**:
   ```bash
   cp setup-package/skill-rules.json.example .claude/skill-rules.json
   ```

2. **Configure for your project** by editing `.claude/skill-rules.json`

The enhanced hook automatically:
- **Analyzes incoming prompts** for skill triggers
- **Suggests relevant skills** based on priority
- **Shows git context** for current work
- **Provides usage instructions** for suggested skills

### Example Output

**Debug Prompt**: `"I have a bug in my React component that is crashing"`
```
🔍 Analyzing your request...

💡 Skill suggestion 1: systematic-debugging
   📝 Debugging methodology with four-phase framework for systematic bug investigation
   🎯 Priority: critical
   🔍 Matched keywords: error, exception, bug, crash, debug

💡 Skill suggestion 2: error-tracking
   📝 Error tracking and monitoring setup for production applications
   🎯 Priority: critical
   🔍 Matched keywords: error, exception, crash, monitoring, logging

💭 To use a skill: `Skill(skill: "skill-name")`
```

## Configuration Guide

### Adding Custom Skills

1. **Add skill configuration** to `.claude/skill-rules.json`:
   ```json
   "your-custom-skill": {
     "type": "domain|testing|observability",
     "enforcement": "suggest|warn|block",
     "priority": "critical|high|medium|low",
     "description": "Human-readable description",
     "promptTriggers": {
       "keywords": ["your", "keywords"],
       "intentPatterns": ["your.*patterns"]
     },
     "fileTriggers": {
       "patterns": ["your/files/*.{ts,py}"],
       "contentSignatures": ["your", "signatures"]
     }
   }
   ```

2. **Update UserPromptSubmit hook** if needed for custom logic

3. **Test with sample prompts**:
   ```bash
   echo "Your custom trigger words" | CLAUDE_PROJECT_DIR=. .claude/hooks/skill-activation-prompt.sh
   ```

### Modifying Existing Skills

- **Change priority**: Adjust `"priority"` level
- **Add triggers**: Extend `"keywords"` or `"intentPatterns"` arrays
- **Update patterns**: Modify `"fileTriggers"` arrays
- **Change enforcement**: Update `"enforcement"` level

### Skipping Skill Checks

Add these to skip activation:
```javascript
// @skip-skill-check
# skip-skill-check
/* skip-skill-check */
<!-- skip-skill-check -->
```

Environment variables:
```bash
export CLAUDE_SKIP_SKILLS="all"  # Skip all skills
export CLAUDE_ENFORCEMENT_LEVEL="suggest"  # Override enforcement
export CLAUDE_PROJECT_TYPE="chess"  # Project type
```

## Performance Settings

- **File scan depth**: 100 files max (configurable)
- **Content scan timeout**: 10 seconds
- **Caching**: Enabled with 10-minute expiry
- **Conflict resolution**: Priority-based

## Integration with Development Workflow

### Git Context
- Detects staged files (`git diff --cached --name-only`)
- Shows current working files for context
- Prioritizes skills based on changed file patterns

### Development Environment Detection
- **Frontend work**: React/Next.js skills when in `apps/web/`
- **Backend work**: FastAPI/Python skills when in `apps/api/`
- **Chess features**: Chess development skills for chess-related content
- **Error scenarios**: Debugging skills for error-related content

## Troubleshooting

### Skills Not Suggested
1. **Check trigger words** match prompt content
2. **Verify skill-rules.json** syntax is valid
3. **Confirm UserPromptSubmit hook** has executable permissions
4. **Test with simple examples** from this guide

### Hook Not Running
1. **Verify file permissions**: `chmod +x .claude/hooks/skill-activation-prompt.sh`
2. **Check hook location**: Must be in `.claude/hooks/` directory
3. **Test manually**: Run hook with sample input

### Performance Issues
1. **Reduce file scan depth** in performance settings
2. **Optimize regex patterns** for faster matching
3. **Enable caching** for repeated scans
4. **Use specific file patterns** to reduce scan scope

## Future Enhancements

- **Learning system**: Track skill usage patterns for better suggestions
- **Multi-skill combinations**: Suggest skill pairs for complex tasks
- **Custom triggers**: User-specific skill preferences
- **Performance optimization**: Faster pattern matching and caching

## Support

For issues with the skills system:
1. Check this documentation
2. Review `CLAUDE_SKILLS_SYSTEM.md` for technical details
3. Test with provided examples
4. Verify configuration syntax

---

**Elucidate Chess** - Make complex clear.