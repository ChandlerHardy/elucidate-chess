# Chess Engine Integration

## Stockfish Integration Patterns

### Installation & Setup
```bash
# Install Stockfish
brew install stockfish  # macOS
sudo apt-get install stockfish  # Linux

# Or download binary from official site
```

### Python Integration (FastAPI)
```python
import subprocess
import chess
import chess.engine

class StockfishEngine:
    def __init__(self, path="/usr/local/bin/stockfish"):
        self.engine_path = path
        self.engine = None

    async def initialize(self):
        self.engine = await chess.engine.SimpleEngine.popen_uci(self.engine_path)

    async def analyze_position(self, fen: str, depth: int = 20):
        board = chess.Board(fen)
        result = await self.engine.analyse(board, chess.engine.Limit(depth=depth))
        return {
            "score": str(result["score"]),
            "pv": [move.uci() for move in result["pv"]],
            "depth": result["depth"],
            "nodes": result["nodes"]
        }

    async def get_best_move(self, fen: str, time_limit: float = 1.0):
        board = chess.Board(fen)
        result = await self.engine.play(board, chess.engine.Limit(time=time_limit))
        return result.move.uci()
```

### JavaScript/TypeScript Integration
```typescript
import { Chess } from 'chess.js';

class ChessEngine {
    private stockfish: Worker;

    constructor() {
        this.stockfish = new Worker('/stockfish.js');
    }

    analyzePosition(fen: string, depth: number = 20): Promise<any> {
        return new Promise((resolve, reject) => {
            this.stockfish.postMessage(`position fen ${fen}`);
            this.stockfish.postMessage(`go depth ${depth}`);

            const handleMessage = (e: MessageEvent) => {
                if (e.data.includes('bestmove')) {
                    this.stockfish.removeEventListener('message', handleMessage);
                    resolve(this.parseAnalysis(e.data));
                }
            };

            this.stockfish.addEventListener('message', handleMessage);
        });
    }
}
```

### UCI Protocol Communication
```python
class UCIEngine:
    def __init__(self, engine_path):
        self.process = subprocess.Popen(
            [engine_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

    def send_command(self, command):
        self.process.stdin.write(f"{command}\n")
        self.process.stdin.flush()

    def read_response(self):
        responses = []
        while True:
            line = self.process.stdout.readline().strip()
            if line:
                responses.append(line)
            if line.startswith("bestmove"):
                break
        return responses
```

## Multi-Engine Analysis
```python
class MultiEngineAnalyzer:
    def __init__(self):
        self.engines = [
            StockfishEngine("/usr/local/bin/stockfish"),
            # Add other engines like Leela, Komodo, etc.
        ]

    async def get_consensus_analysis(self, fen: str):
        analyses = []
        for engine in self.engines:
            await engine.initialize()
            analysis = await engine.analyze_position(fen)
            analyses.append(analysis)

        # Find consensus moves and evaluations
        return self.consolidate_analyses(analyses)
```

## Performance Optimization

### Caching Analysis Results
```python
from functools import lru_cache
import hashlib

class CachedAnalyzer:
    @lru_cache(maxsize=1000)
    def cached_analysis(self, fen: str, depth: int):
        # Create cache key from FEN and depth
        cache_key = hashlib.md5(f"{fen}_{depth}".encode()).hexdigest()

        # Check cache first
        cached = self.get_from_cache(cache_key)
        if cached:
            return cached

        # Perform analysis and cache result
        result = self.analyze_position(fen, depth)
        self.save_to_cache(cache_key, result)
        return result
```

### Batch Analysis
```python
async def batch_analyze_positions(self, positions: List[str]):
    """Analyze multiple positions efficiently"""
    tasks = [self.analyze_position(fen) for fen in positions]
    results = await asyncio.gather(*tasks)
    return dict(zip(positions, results))
```

## Error Handling & Reliability
```python
class RobustEngine:
    def __init__(self, engine_path):
        self.engine_path = engine_path
        self.max_retries = 3

    async def safe_analyze(self, fen: str, depth: int = 20):
        for attempt in range(self.max_retries):
            try:
                await self.initialize()
                return await self.analyze_position(fen, depth)
            except Exception as e:
                if attempt == self.max_retries - 1:
                    raise e
                await self.restart_engine()
```

## Integration with AI Explanations
```python
async def explain_position_with_ai(self, fen: str):
    # Get engine analysis first
    analysis = await self.analyze_position(fen)

    # Generate AI explanation based on analysis
    explanation = await self.ai_client.explain_position(
        fen=fen,
        evaluation=analysis["score"],
        best_moves=analysis["pv"][:3],
        tactical_patterns=self.detect_tactics(fen)
    )

    return {
        "analysis": analysis,
        "explanation": explanation
    }
```