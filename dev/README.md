# Elucidate Chess - Development Documentation

**Purpose:** Maintain project context across Claude Code sessions and prevent the confusion I experienced about your architecture.

## The Problem

Context resets cause Claude to:
- ❌ Forget project architecture decisions
- ❌ Lose track of what's been implemented
- ❌ Make incorrect assumptions (like thinking you had a monorepo)
- ❌ Waste time re-discovering context

## The Solution

Three-file dev docs structure for complex tasks:
```
dev/active/[task-name]/
├── [task-name]-plan.md      # Strategic plan
├── [task-name]-context.md   # Current state & decisions
└── [task-name]-tasks.md     # Implementation checklist
```

## When to Use Dev Docs

✅ **Use for:**
- Complex multi-day features
- Multi-session tasks
- Architecture decisions
- Research projects (like en-croissant analysis)

❌ **Skip for:**
- Simple bug fixes
- Single-file changes
- Quick updates

## Current Active Tasks

### en-croissant Analysis
**Location:** `dev/active/en-croissant-analysis/`
**Purpose:** Analyze en-croissant repo to decide fork vs continue approach
**Status:** In progress
**Finding:** Your current hybrid polyrepo architecture is superior

## Dev Docs Workflow

### Starting New Tasks
```bash
# Create task directory
mkdir -p dev/active/your-task-name/

# Claude will create three files:
# - your-task-name-plan.md
# - your-task-name-context.md
# - your-task-name-tasks.md
```

### During Implementation
1. **Update context.md frequently** - mark completed work, note decisions
2. **Check off tasks in tasks.md** as you complete them
3. **Update plan.md** if scope changes

### After Context Reset
Claude reads all three files and resumes exactly where you left off.

## Best Practices

- **Update SESSION PROGRESS section** in context.md after major milestones
- **Make tasks actionable** with specific file names and acceptance criteria
- **Keep plan current** when scope changes
- **Archive completed tasks** to `dev/archive/` when done

## This Prevents

- ✅ Architecture confusion (like my monorepo mistake)
- ✅ Repeated work after context resets
- ✅ Lost decisions and progress
- ✅ Wasted time re-discovering context

---

**Remember:** Good dev docs save hours per context reset. Use them for any task that spans multiple sessions or has significant complexity.