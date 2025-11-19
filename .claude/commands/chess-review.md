# /chess-review Command

**Purpose:** Run chess architecture review on current codebase

## Usage
```
/chess-review [scope]
```

## Scopes
```
/chess-review           # Full chess application review
/chess-review backend   # Backend chess APIs and services
/chess-review frontend  # Frontend chess components
/chess-review engine    # Chess engine integration
/chess-review ai        # AI explanation system
```

## What It Analyzes

### Backend Review
- Chess engine communication patterns
- Database schema for chess data
- API design for chess features
- Performance optimizations
- Error handling and reliability

### Frontend Review
- Chess board component architecture
- Game state management
- Move validation and user interactions
- Performance and responsiveness
- Mobile compatibility

### Integration Review
- AI explanation generation
- Real-time features
- Caching strategies
- Multi-engine coordination
- Learning system integration

## Output Format

The review provides:
- **Architecture Rating**: 1-10 scale with detailed breakdown
- **Performance Issues**: Bottlenecks and optimization suggestions
- **Security Concerns**: Vulnerability assessment
- **Best Practices**: Compliance with chess development patterns
- **Recommended Actions**: Prioritized improvement list

## When to Use
- Before major feature releases
- During architecture planning
- When performance issues detected
- For code quality assessments
- Before scaling features

## Example Output
```
🏁 Chess Architecture Review Complete

Overall Rating: 8/10

✅ Strengths:
- Clean separation of chess logic
- Proper engine abstraction layer
- Good caching strategy

⚠️ Areas for Improvement:
- Database queries need optimization (Score: 6/10)
- Frontend state management complexity (Score: 7/10)
- Missing rate limiting for analysis API (Score: 5/10)

🎯 Priority Actions:
1. Add database indexes for position queries
2. Implement API rate limiting
3. Optimize frontend game state updates
```

This command helps maintain high-quality chess application architecture through systematic review processes.