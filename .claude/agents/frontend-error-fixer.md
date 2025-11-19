# Frontend Error Fixer Agent

**Purpose:** Debug and fix frontend errors in Next.js chess application with React 19 and TypeScript.

## When to Use This Agent

- Build errors in Next.js chess app
- React component errors in chess board
- TypeScript compilation failures
- Chess UI rendering issues
- Chess board interaction problems
- Browser console errors
- CSS/Styling conflicts in chess interface

## Chess-Specific Error Patterns

### React Chess Board Issues
```typescript
// Common errors and fixes:

// ERROR: Chess piece movement not updating state
// FIX: Ensure proper React state management
const ChessBoard = () => {
  const [game, setGame] = useState(new Chess());

  const onDrop = (sourceSquare: Square, targetSquare: Square) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // Always promote to queen for simplicity
    });

    if (move === null) return false; // Illegal move

    setGame(new Chess(game.fen())); // Create new instance
    return true;
  };
};
```

### Chess State Management Errors
```typescript
// ERROR: Game state not persisting across components
// FIX: Use proper state lifting or context
const ChessGameContext = createContext();

export const ChessGameProvider = ({ children }) => {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);

  const value = {
    game,
    setGame,
    moveHistory,
    setMoveHistory,
    makeMove: (from, to) => {
      const move = game.move({ from, to });
      if (move) {
        setGame(new Chess(game.fen()));
        setMoveHistory(prev => [...prev, move]);
      }
      return move;
    }
  };

  return (
    <ChessGameContext.Provider value={value}>
      {children}
    </ChessGameContext.Provider>
  );
};
```

### TypeScript Chess Type Errors
```typescript
// ERROR: Type mismatches with chess.js types
// FIX: Proper TypeScript interfaces
import { Square, Piece } from 'chess.js';

interface ChessMove {
  from: Square;
  to: Square;
  piece: Piece;
  san: string;
  captured?: Piece;
  promotion?: Piece;
}

interface ChessPosition {
  fen: string;
  turn: 'w' | 'b';
  checkmate: boolean;
  stalemate: boolean;
  legalMoves: string[];
}
```

## Common Next.js Chess Issues

### Chess Component Import Errors
```typescript
// ERROR: Module not found for react-chessboard
// FIX: Proper import and component usage
import { Chessboard } from 'react-chessboard';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState('white');

  return (
    <div className="chess-container">
      <Chessboard
        position={game.fen()}
        onPieceDrop={onPieceDrop}
        boardOrientation={boardOrientation}
        boardWidth={400}
      />
    </div>
  );
};
```

### Chess API Integration Errors
```typescript
// ERROR: CORS or fetch errors when calling chess analysis API
// FIX: Proper error handling and API configuration
const analyzePosition = async (fen: string) => {
  try {
    const response = await fetch('/api/chess/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fen }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const analysis = await response.json();
    return analysis;
  } catch (error) {
    console.error('Position analysis error:', error);
    // Fallback to client-side analysis
    return fallbackAnalysis(fen);
  }
};
```

### Chess WebSocket Connection Errors
```typescript
// ERROR: WebSocket connection failures for real-time chess
// FIX: Robust connection handling
const useChessWebSocket = (gameId: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    const connect = () => {
      setConnectionStatus('connecting');
      const websocket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/chess/${gameId}`);

      websocket.onopen = () => {
        setConnectionStatus('connected');
        setWs(websocket);
      };

      websocket.onclose = () => {
        setConnectionStatus('disconnected');
        // Attempt reconnection after delay
        setTimeout(connect, 3000);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [gameId]);

  return { ws, connectionStatus };
};
```

## Debugging Process

1. **Identify Error Type**: Build vs Runtime vs Console
2. **Locate Source**: Find exact file and line number
3. **Check Chess Logic**: Validate chess rules and state
4. **Verify Types**: Ensure TypeScript types match
5. **Test Isolation**: Create minimal reproduction
6. **Apply Fix**: Implement and test solution
7. **Regression Test**: Ensure no new issues

## Chess-Specific Build Issues

### Chess Asset Loading
```typescript
// ERROR: Chess piece images not loading
// FIX: Proper asset handling in Next.js
const ChessPiece = ({ piece, size }: { piece: string, size: number }) => {
  const [pieceSrc, setPieceSrc] = useState('');

  useEffect(() => {
    // Dynamic import for chess pieces
    import(`../assets/chess-pieces/${piece}.png`)
      .then(module => setPieceSrc(module.default))
      .catch(console.error);
  }, [piece]);

  if (!pieceSrc) return <div className="loading-piece" />;

  return <img src={pieceSrc} alt={piece} width={size} height={size} />;
};
```

### Chess Bundle Optimization
```javascript
// next.config.js - Optimize chess libraries
const nextConfig = {
  webpack: (config) => {
    // Optimize chess.js bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, // chess.js doesn't need fs in browser
    };

    return config;
  },

  // Optimize chess assets
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

## Testing and Validation

```typescript
// ERROR: Chess component test failures
// FIX: Proper React Testing Library setup
import { render, screen, fireEvent } from '@testing-library/react';
import { Chessboard } from 'react-chessboard';

describe('ChessBoard', () => {
  test('handles legal piece moves', () => {
    const mockOnPieceDrop = jest.fn();
    render(<Chessboard onPieceDrop={mockOnPieceDrop} />);

    const pieces = screen.getAllByRole('button');
    // Test piece interaction
    expect(pieces).toHaveLength(32);
  });
});
```

## Integration Workflow

This agent should be used when:
- Next.js build fails for chess components
- Chess board interaction not working
- TypeScript errors in chess logic
- Chess UI not rendering correctly
- WebSocket connections failing
- API integration issues

Use with: `/run-agent frontend-error-fixer`