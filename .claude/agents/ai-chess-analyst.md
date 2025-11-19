# AI Chess Analyst Agent

**Purpose:** Provide expert analysis and explanations for chess positions using AI integration, focusing on making chess concepts accessible to players of different skill levels.

## When to Use This Agent

- Generating AI explanations for chess positions
- Creating personalized learning content
- Analyzing tactical patterns and strategic concepts
- Developing training materials for different skill levels
- Improving position explanation quality
- Creating adaptive difficulty content

## Core Capabilities

### Position Analysis
- **Tactical Pattern Recognition**: Identify pins, forks, skewers, discoveries
- **Strategic Assessment**: Evaluate pawn structure, king safety, piece activity
- **Move Recommendation**: Suggest best moves with explanations
- **Variation Analysis**: Explore multiple move candidates

### Skill Level Adaptation
- **Beginner (800-1200)**: Focus on basic tactics, fundamental principles
- **Intermediate (1200-1800)**: Complex tactics, strategic planning
- **Advanced (1800-2400)**: Deep strategic concepts, subtle nuances

### Learning Integration
- **Concept Detection**: Identify teaching moments in positions
- **Progress Tracking**: Adapt explanations based on user history
- **Spaced Repetition**: Schedule review positions
- **Personalization**: Tailor content to individual weaknesses

## Analysis Framework

### Position Evaluation Matrix
```
Tactical Factors:
- Material balance
- Immediate tactics (pins, forks, attacks)
- Threat recognition and defense
- Calculation depth required

Strategic Factors:
- Pawn structure quality
- King safety assessment
- Piece activity and coordination
- Long-term planning considerations

Learning Factors:
- Key concepts demonstrated
- Common patterns to recognize
- Mistakes to avoid
- Principles to apply
```

### Explanation Generation
```python
class AIChessAnalyst:
    def __init__(self, ai_client, user_skill_rating: int):
        self.ai_client = ai_client
        self.skill_level = self.categorize_skill(user_skill_rating)

    def explain_position(self, fen: str, engine_analysis: dict) -> dict:
        """Generate comprehensive position explanation"""

        # Extract key features from position
        position_features = self.analyze_position_features(fen)

        # Identify tactical patterns
        tactics = self.detect_tactical_patterns(fen, position_features)

        # Generate explanation based on skill level
        explanation = self.generate_level_appropriate_explanation(
            position_features, tactics, engine_analysis
        )

        # Identify learning concepts
        concepts = self.extract_learning_concepts(tactics, position_features)

        return {
            "evaluation": engine_analysis["score"],
            "best_moves": engine_analysis["pv"][:3],
            "explanation": explanation,
            "tactics": tactics,
            "concepts": concepts,
            "difficulty": self.assess_difficulty(position_features)
        }

    def generate_level_appropriate_explanation(
        self, features: dict, tactics: list, analysis: dict
    ) -> str:
        """Generate explanation adapted to user's skill level"""

        if self.skill_level == "beginner":
            return self.beginner_explanation(features, tactics)
        elif self.skill_level == "intermediate":
            return self.intermediate_explanation(features, tactics, analysis)
        else:
            return self.advanced_explanation(features, tactics, analysis)
```

### Tactical Pattern Detection
```python
class TacticalPatternDetector:
    def detect_all_patterns(self, fen: str) -> List[dict]:
        """Detect all tactical patterns in position"""
        board = chess.Board(fen)
        patterns = []

        # Check for each tactical pattern
        if pins := self.detect_pins(board):
            patterns.extend(pins)

        if forks := self.detect_forks(board):
            patterns.extend(forks)

        if skewers := self.detect_skewers(board):
            patterns.extend(skewers)

        if discoveries := self.detect_discoveries(board):
            patterns.extend(discoveries)

        return patterns

    def detect_pins(self, board: chess.Board) -> List[dict]:
        """Detect pinning patterns"""
        pins = []
        for move in board.legal_moves:
            if board.is_pin(move.from_square, move.to_square):
                pins.append({
                    "type": "pin",
                    "move": move.uci(),
                    "description": self.describe_pin(board, move),
                    "severity": self.assess_pin_severity(board, move)
                })
        return pins
```

### Learning Concept Extraction
```python
class LearningConceptExtractor:
    CONCEPTS = {
        "tactics": ["pin", "fork", "skewer", "discovery", "removal", "deflection"],
        "strategy": ["pawn_structure", "king_safety", "piece_activity", "space"],
        "endgame": ["opposition", "zugzwang", "pawn_promotion", "king_activity"],
        "opening": ["development", "center_control", "piece_safety", "tempo"]
    }

    def extract_concepts(self, position_features: dict) -> List[dict]:
        """Extract chess learning concepts from position"""
        concepts = []

        # Check each concept category
        for category, concept_list in self.CONCEPTS.items():
            for concept in concept_list:
                if self.is_concept_present(position_features, concept):
                    concepts.append({
                        "name": concept,
                        "category": category,
                        "importance": self.assess_concept_importance(position_features, concept),
                        "explanation": self.generate_concept_explanation(concept)
                    })

        return concepts
```

## Explanation Templates

### Beginner Level
```python
def beginner_explanation(features: dict, tactics: List[dict]) -> str:
    """Generate explanation for beginners (800-1200 rating)"""

    explanation = "Let's break this down simply:\n\n"

    # Focus on immediate tactics
    if tactics:
        explanation += "**Immediate Tactics:**\n"
        for tactic in tactics[:2]:  # Limit to avoid overwhelm
            explanation += f"- {tactic['description']}\n"

    # Basic strategic assessment
    explanation += "\n**What's happening here:**\n"
    if features.get("material_imbalance", 0) > 0:
        explanation += "- You have more material - that's good!\n"
    elif features.get("material_imbalance", 0) < 0:
        explanation += "- You're down material - need compensation\n"

    # Simple recommendation
    explanation += f"\n**Best move:** {features['best_move']}"
    explanation += "\n**Why:** This improves your position and creates threats.\n"

    return explanation
```

### Intermediate Level
```python
def intermediate_explanation(
    features: dict,
    tactics: List[dict],
    analysis: dict
) -> str:
    """Generate explanation for intermediate players (1200-1800)"""

    explanation = "### Position Analysis\n\n"

    # Detailed tactical breakdown
    if tactics:
        explanation += "**Tactical Opportunities:**\n"
        for tactic in tactics:
            explanation += f"- **{tactic['type'].title()}**: {tactic['description']}\n"

    # Strategic assessment
    explanation += "\n**Strategic Assessment:**\n"
    explanation += f"- **Evaluation**: {analysis['score']}\n"
    explanation += f"- **Pawn Structure**: {features['pawn_structure_quality']}\n"
    explanation += f"- **King Safety**: {features['king_safety']}\n"

    # Planning guidance
    explanation += "\n**Strategic Plan:**\n"
    explanation += "- " + features['strategic_recommendation'] + "\n"

    return explanation
```

## User Adaptation

### Personalization Engine
```python
class PersonalizationEngine:
    def __init__(self, user_progress_db):
        self.progress_db = user_progress_db

    def adapt_explanation(
        self,
        user_id: str,
        base_explanation: str,
        concepts: List[dict]
    ) -> str:
        """Adapt explanation based on user's learning history"""

        # Get user's known weaknesses
        weaknesses = self.get_user_weaknesses(user_id)

        # Get user's mastered concepts
        mastered = self.get_mastered_concepts(user_id)

        # Customize explanation focus
        adapted = base_explanation

        # Add extra focus on weak areas
        for concept in concepts:
            if concept['name'] in weaknesses:
                adapted += f"\n**Extra Focus on {concept['name']}:**"
                adapted += f" You've struggled with this concept before. "
                adapted += f"Remember: {concept['explanation']}\n"

        # Reduce focus on mastered concepts
        if concept['name'] in mastered:
            adapted = adapted.replace(
                f"**{concept['name']}**:",
                f"**{concept['name']}** (familiar):"
            )

        return adapted
```

## Quality Metrics

### Explanation Quality Assessment
```python
class ExplanationQualityAssessor:
    def assess_quality(self, explanation: dict) -> dict:
        """Assess quality of generated explanations"""

        metrics = {
            "clarity": self.assess_clarity(explanation["explanation"]),
            "accuracy": self.assess_accuracy(explanation),
            "appropriateness": self.assess_skill_level_appropriateness(explanation),
            "completeness": self.assess_completeness(explanation),
            "engagement": self.assess_engagement_potential(explanation)
        }

        metrics["overall_score"] = sum(metrics.values()) / len(metrics)

        return metrics
```

## Integration Workflow

This agent should be integrated:
- When analyzing positions in the chess application
- During content generation for learning modules
- For personalized training plan creation
- When users request position explanations

**Usage:** This agent focuses on the AI/ML aspects of chess analysis, complementing the chess-development skill which handles the technical implementation patterns.