# /dev-docs Command

**Purpose:** Create structured development documentation for complex tasks

## Usage
```
/dev-docs <task-description>
```

## Examples
```
/dev-docs implement chess engine integration
/dev-docs create AI-powered position analysis
/dev-docs refactor authentication system
/dev-docs add multiplayer chess features
```

## What It Creates
Creates three-file documentation structure:
```
dev/active/<task-name>/
├── <task-name>-plan.md     # Strategic plan and phases
├── <task-name>-context.md  # Current state and decisions
└── <task-name>-tasks.md    # Implementation checklist
```

## When to Use
- Complex multi-session tasks
- Features requiring multiple components
- Architecture decisions
- Research and implementation projects

## Implementation
This command analyzes the current codebase, understands the task scope, and generates comprehensive development documentation following the three-file pattern.

The documentation includes:
- **Plan**: Strategic approach with phases and acceptance criteria
- **Context**: Current state, key files, important decisions
- **Tasks**: Detailed implementation checklist

## Benefits
- Survives context resets
- Tracks progress across sessions
- Documents decisions and rationale
- Provides clear implementation roadmap

Use this command when starting any complex development task to maintain context and ensure systematic approach.