# Claude Code Infrastructure Setup Tests

**Purpose:** Verify that all Claude Code hooks, skills, agents, and commands are working correctly after restart.

## 🚀 Quick Tests to Run After Restart

### 1. Hook Tests
**Expected:** Should see hook success messages in system reminders

✅ **Test:** Any prompt (should trigger UserPromptSubmit hook)
- Look for: "UserPromptSubmit hook success: 🤖 Skill Activation Analysis Complete"

✅ **Test:** Make a file change (should trigger PostToolUse hook)
- Look for: "PostToolUse hook success" and reminder to update dev docs

### 2. Skill Activation Tests
**Expected:** Relevant skills should auto-suggest based on keywords

✅ **Test FastAPI Skill:**
```
I need to create a FastAPI endpoint with Pydantic models and SQLAlchemy integration
```
→ Should suggest: **fastapi-development** skill

✅ **Test Chess Skill:**
```
How do I integrate Stockfish chess engine with move validation using PGN format?
```
→ Should suggest: **chess-development** skill

✅ **Test Frontend Skill:**
```
My React component with TypeScript and Tailwind CSS is not rendering properly
```
→ Should suggest: **frontend-dev-guidelines** skill

### 3. Command Tests
**Expected:** Commands should execute and create/update files

✅ **Test dev-docs Command:**
```
/dev-docs test feature implementation
```
→ Should create: `dev/active/test-feature-implementation/` with 3 files

✅ **Test dev-docs-update Command:**
```
/dev-docs-update
```
→ Should update existing dev docs with session progress

✅ **Test route-research Command:**
```
/route-research-for-testing chess-api
```
→ Should create API testing documentation in `dev/testing/`

### 4. Agent Tests
**Expected:** Agents should load and provide specialized assistance

✅ **Test Frontend Error Fixer:**
```
/run-agent frontend-error-fixer

I'm getting a React hydration error in my Next.js chess board component
```
→ Should analyze and suggest fixes for React/Next.js issues

✅ **Test Documentation Architect:**
```
/run-agent documentation-architect

Create API documentation for my chess analysis endpoints
```
→ Should generate comprehensive API documentation

✅ **Test Chess Architecture Reviewer:**
```
/run-agent chess-architecture-reviewer

Review my FastAPI chess application structure
```
→ Should analyze chess-specific architectural patterns

### 5. File Structure Verification
**Expected:** All Claude Code infrastructure files should be present

✅ **Check Core Structure:**
```bash
ls -la .claude/
# Should see: hooks/, skills/, agents/, commands/, settings.json, skill-rules.json

ls -la .claude/hooks/
# Should see: skill-activation-prompt.sh, post-tool-use-tracker.sh, package.json

ls -la .claude/skills/
# Should see: chess-development/, fastapi-development/

ls -la .claude/agents/
# Should see: chess-architecture-reviewer.md, ai-chess-analyst.md, etc.

ls -la .claude/commands/
# Should see: dev-docs.md, dev-docs-update.md, route-research-for-testing.md
```

### 6. Configuration Tests
**Expected:** Settings should be loaded correctly

✅ **Check settings.json:**
```bash
cat .claude/settings.json
# Should contain proper hooks configuration and paths
```

✅ **Check skill-rules.json:**
```bash
cat .claude/skill-rules.json
# Should contain fastapi-development, chess-development, and other skills
```

## 🎯 Success Indicators

### ✅ Working Correctly
- Hook success messages appear in system reminders
- Skills auto-suggest based on relevant keywords
- Commands create proper file structures
- Agents provide specialized assistance
- All infrastructure files are present and accessible

### ❌ Troubleshooting Needed

**No hook messages:**
- Check settings.json paths are correct
- Verify scripts are executable: `chmod +x .claude/hooks/*.sh`
- Restart Claude Code again

**Skills not activating:**
- Verify skill-rules.json has valid JSON syntax
- Check skill files exist in `.claude/skills/`
- Test with exact keyword matches from skill-rules.json

**Commands not found:**
- Verify commands are in `.claude/commands/`
- Check command files have proper format
- Restart Claude Code (commands cached on startup)

**Agents not loading:**
- Check agents are in `.claude/agents/`
- Verify agent files have proper markdown format
- Test agent name exactly as listed in directory

## 📝 Quick Test Script

Run these in order to verify everything:

1. `ls -la .claude/` (check structure)
2. Any prompt (check hooks)
3. `I need FastAPI help` (check skill activation)
4. `/dev-docs test` (check commands)
5. `ls -la dev/active/` (verify command worked)
6. `/run-agent frontend-error-fixer` (check agents)

## 🚀 Next Steps After Verification

If all tests pass:
1. ✅ Infrastructure is working correctly
2. ✅ Ready for productive development
3. ✅ Can proceed with user-level setup migration
4. ✅ Skills and agents will enhance development workflow

If any tests fail:
1. 🔍 Check the corresponding troubleshooting section above
2. 🔧 Fix configuration issues
3. 🔄 Restart Claude Code and retest
4. 📝 Document any adjustments needed

**Remember:** The UserPromptSubmit hook should trigger on every prompt, so you should see the skill activation message regularly!