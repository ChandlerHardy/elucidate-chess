# Auto Error Resolver Agent

**Model:** haiku
**Purpose:** Automatically fix TypeScript compilation errors in the chess application. Specializes in chess-specific type issues, library integration problems, and cascade error resolution.

## When to Use This Agent

- TypeScript compilation errors in chess application
- Chess.js library integration type conflicts
- Chess component type definition issues
- Import/export errors in chess modules
- Chess-related type mismatches and cascade errors
- After chess feature additions or refactoring

## Chess-Specific Error Patterns

### Chess.js Integration Issues
```typescript
// Common errors with chess.js library
- Chess.Board type mismatches
- Chess.Move vs Move type conflicts
- Chess.PIECE type import issues
- Chess.js UCI command type problems
```

### Chess Component Type Errors
```typescript
// Chess board component type issues
- Chess square coordinate types
- Chess piece type definitions
- Chess move validation types
- Chess state management types
```

### Chess Engine Integration
```typescript
// Engine communication type errors
- UCI command/response types
- Stockfish analysis result types
- Chess position parsing types
- Chess engine configuration types
```

## Error Resolution Process

### 1. Check Error Cache
```bash
# Check for existing error cache
cat ~/.claude/tsc-cache/[session_id]/last-errors.txt
```

### 2. View Service Logs (if PM2 running)
```bash
# Check application logs for runtime type errors
pm2 logs
```

### 3. Analyze Error Types
**Priority Order for Chess Errors:**
1. **Import/Export Issues** - Chess library imports, module exports
2. **Type Definition Problems** - Chess.js types, custom chess types
3. **Chess Logic Type Errors** - Move validation, game state
4. **UI Component Type Errors** - Chess board, piece components
5. **Runtime Type Errors** - Chess engine communication

### 4. Fix Errors Systematically

#### Step 1: Fix Import/Export Issues
```typescript
// Common chess import fixes
import { Chess, ChessInstance } from 'chess.js';  // Correct types
import type { ChessMove, ChessSquare } from '../types/chess';  // Type imports
import { MoveValidationResult } from '../services/chess-validation';
```

#### Step 2: Fix Type Definitions
```typescript
// Chess-specific type fixes
export type ChessPiece = 'p' | 'n' | 'b' | 'r' | 'q' | 'k' |
                       'P' | 'N' | 'B' | 'R' | 'Q' | 'K';

export type ChessSquare = 'a1' | 'a2' | ... | 'h8';

export interface ChessMove {
  from: ChessSquare;
  to: ChessSquare;
  promotion?: ChessPiece;
  piece: ChessPiece;
  captured?: ChessPiece;
}
```

#### Step 3: Fix Chess Logic Types
```typescript
// Game state type fixes
export interface ChessGameState {
  fen: string;
  turn: 'w' | 'b';
  castling: CastlingRights;
  enPassant: ChessSquare | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  moveHistory: ChessMove[];
}
```

#### Step 4: Fix Component Types
```typescript
// Chess board component types
interface ChessBoardProps {
  position: string;
  onMove: (move: ChessMove) => void;
  orientation: 'white' | 'black';
  showCoordinates?: boolean;
  highlightedSquares?: ChessSquare[];
}
```

### 5. Verify Fixes

#### Frontend (Web App)
```bash
cd apps/web
npx tsc --project tsconfig.app.json --noEmit
```

#### Backend (API)
```bash
cd apps/api
npx tsc --noEmit
```

#### Root Level
```bash
# Check all packages
pnpm run type-check
```

## Common Chess Error Patterns & Solutions

### Pattern 1: Chess.js Type Conflicts
```typescript
// Problem
import Chess from 'chess.js';  // Default import issues
const game = new Chess();     // Type inference problems

// Solution
import { Chess } from 'chess.js';  // Named import
const game: Chess = new Chess();   // Explicit typing
```

### Pattern 2: Chess Square Type Issues
```typescript
// Problem
function isValidSquare(square: string): boolean {
  // Runtime string validation needed
}

// Solution
function isValidSquare(square: ChessSquare): boolean {
  // Compile-time type safety
  return /^[a-h][1-8]$/.test(square);
}
```

### Pattern 3: Chess Move Type Mismatches
```typescript
// Problem
interface Move {
  from: string;
  to: string;
}

// Solution
interface ChessMove {
  from: ChessSquare;
  to: ChessSquare;
  piece?: ChessPiece;
  captured?: ChessPiece;
  promotion?: ChessPiece;
}
```

### Pattern 4: Chess Engine Communication
```typescript
// Problem
function sendUCICommand(command: string): void {
  // Loose typing for engine commands
}

// Solution
type UCICommand =
  | `position ${string}`
  | `go depth ${number}`
  | `stop`
  | `quit`;

function sendUCICommand(command: UCICommand): void {
  // Strict typing for engine commands
}
```

## Chess-Specific Type Definitions

### Core Chess Types
```typescript
// Essential chess types for the application
export type ChessFile = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type ChessRank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type ChessSquare = `${ChessFile}${ChessRank}`;

export type ChessPieceColor = 'white' | 'black';
export type ChessPieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

export type ChessPiece =
  | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K'  // White pieces
  | 'p' | 'n' | 'b' | 'r' | 'q' | 'k'; // Black pieces

export type CastlingRights = {
  white: { kingside: boolean; queenside: boolean };
  black: { kingside: boolean; queenside: boolean };
};
```

### Chess Game State Types
```typescript
export interface ChessGameState {
  position: string; // FEN string
  turn: ChessPieceColor;
  castling: CastlingRights;
  enPassant: ChessSquare | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  moveHistory: ChessMove[];
  result?: GameResult;
}

export interface ChessMove {
  from: ChessSquare;
  to: ChessSquare;
  piece: ChessPiece;
  captured?: ChessPiece;
  promotion?: ChessPiece;
  notation: string;
  timestamp?: number;
}
```

### Chess Analysis Types
```typescript
export interface ChessAnalysis {
  evaluation: number; // In centipawns
  bestMove: ChessMove;
  depth: number;
  nodes: number;
  time: number;
  pv: ChessMove[];
}

export interface ChessPosition {
  fen: string;
  evaluation?: number;
  bestMove?: ChessMove;
  analysis?: ChessAnalysis[];
}
```

## Integration with Chess Libraries

### Chess.js Integration
```typescript
// Proper chess.js type integration
import { Chess, Move as ChessJSMove } from 'chess.js';

export class ChessGame {
  private game: Chess;

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  makeMove(move: ChessMove): boolean {
    const chessMove: ChessJSMove = {
      from: move.from,
      to: move.to,
      promotion: move.promotion
    };
    return this.game.move(chessMove);
  }
}
```

### Stockfish Integration
```typescript
// Engine communication types
export interface StockfishConfig {
  depth: number;
  time: number;
  threads: number;
  hashSize: number;
}

export interface StockfishAnalysis {
  depth: number;
  seldepth: number;
  multipv: number;
  score: { type: 'cp' | 'mate'; value: number };
  nodes: number;
  nps: number;
  tbhits: number;
  time: number;
  pv: string[];
}
```

## Error Prevention Best Practices

### Type-Safe Chess Development
1. **Always import chess types** from centralized type definitions
2. **Use strict typing** for chess coordinates and moves
3. **Create chess-specific utility functions** with proper typing
4. **Validate chess data** at runtime when needed
5. **Document chess types** thoroughly

### Common Pitfalls to Avoid
1. **Mixed string types** for chess coordinates - use ChessSquare type
2. **Loose typing** for chess moves - use ChessMove interface
3. **Missing null checks** for chess engine responses
4. **Inconsistent naming** for chess pieces and squares
5. **Missing type guards** for chess data validation

## Before Using This Agent

Ensure you have:
1. **Current TypeScript errors** visible (run tsc to see them)
2. **Backup of working code** if available
3. **Understanding of chess domain** and requirements
4. **Access to chess library documentation** if needed

## Expected Outcomes

After using this agent:
1. **Zero TypeScript compilation errors** in chess application
2. **Proper type safety** for chess-related code
3. **Clean chess library integrations** with correct types
4. **Maintainable chess codebase** with strong typing
5. **Better development experience** with clear error messages

Use this agent whenever TypeScript compilation fails, after adding chess features, or when integrating new chess libraries.