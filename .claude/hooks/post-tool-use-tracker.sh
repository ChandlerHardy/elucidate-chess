#!/bin/bash

# Post Tool Use Tracker Hook
# Tracks file changes to maintain context and suggest next actions

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Create tracking directory
TRACKING_DIR="$PROJECT_ROOT/.claude/tracking"
mkdir -p "$TRACKING_DIR"

# Get current timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Track the file modification
echo "[$TIMESTAMP] File modified: $CLAUDE_MODIFIED_FILE" >> "$TRACKING_DIR/file-changes.log"

# Update session context if we have active dev docs
if [ -d "$PROJECT_ROOT/dev/active" ]; then
    # Find the most recent active task
    LATEST_TASK=$(ls -t "$PROJECT_ROOT/dev/active" | head -1)
    if [ -n "$LATEST_TASK" ]; then
        CONTEXT_FILE="$PROJECT_ROOT/dev/active/$LATEST_TASK/$LATEST_TASK-context.md"
        if [ -f "$CONTEXT_FILE" ]; then
            # Add a reminder to update context
            echo ""
            echo "💡 Remember to update your dev docs context:"
            echo "   File: $CONTEXT_FILE"
            echo "   Task: $LATEST_TASK"
            echo ""
        fi
    fi
fi

echo "📝 Change tracked successfully"