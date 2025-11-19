# React Hydration Error Troubleshooting Guide

## What is React Hydration Error?

React hydration errors occur when the server-rendered HTML doesn't match what React expects to render on the client side. This happens when:

1. Server generates HTML with certain values
2. Client-side React renders with different values
3. React detects the mismatch and throws a hydration error

## Common Causes in Chess Board Components

### 1. **Window/Object Access Before Mount**
```typescript
// ❌ BAD - Accesses window during SSR
const ChessBoard = () => {
  const [size, setSize] = useState(window.innerWidth > 768 ? 500 : 300);
  // Hydration error: window.innerWidth is different on server vs client
};

// ✅ GOOD - Use useEffect for client-side only code
const ChessBoard = () => {
  const [size, setSize] = useState(500); // Default value for SSR
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSize(window.innerWidth > 768 ? 500 : 300);
  }, []);
};
```

### 2. **Date/Random Values During SSR**
```typescript
// ❌ BAD - Different values on server vs client
const ChessBoard = () => {
  const [gameId] = useState(Date.now().toString());
  const [randomOrientation] = useState(Math.random() > 0.5 ? 'white' : 'black');
};

// ✅ GOOD - Use consistent initial values
const ChessBoard = () => {
  const [gameId, setGameId] = useState('initial');
  const [orientation, setOrientation] = useState('white');

  useEffect(() => {
    setGameId(Date.now().toString());
    setOrientation(Math.random() > 0.5 ? 'white' : 'black');
  }, []);
};
```

### 3. **Browser APIs During SSR**
```typescript
// ❌ BAD - Browser APIs not available on server
const ChessBoard = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
};

// ✅ GOOD - Check for browser availability
const ChessBoard = () => {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(localStorage.getItem('theme') || 'light');
  }, []);
};
```

### 4. **Chess.js Initialization Issues**
```typescript
// ❌ BAD - Chess.js might behave differently on server
const ChessBoard = () => {
  const [game] = useState(new Chess());
  // Potential hydration issues if Chess.js has browser-specific behavior
};

// ✅ GOOD - Initialize Chess.js properly
const ChessBoard = () => {
  const [game, setGame] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGame(new Chess());
  }, []);
};
```

## Solutions Implemented in Our Chess Components

### 1. **Mounted State Pattern**
```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <div>Loading...</div>; // Consistent placeholder
}
```

### 2. **Proper Chess.js Initialization**
```typescript
const [game, setGame] = useState<Chess>(() => {
  if (typeof window !== "undefined") {
    return new Chess(initialFen === "start" ? undefined : initialFen);
  }
  return null as any;
});

useEffect(() => {
  if (!game && typeof window !== "undefined") {
    setGame(new Chess(initialFen === "start" ? undefined : initialFen));
  }
}, [initialFen, game]);
```

### 3. **State Management with Context**
```typescript
export function ChessGameProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch({ type: "INITIALIZE_GAME" });
  }, []);

  if (!mounted) {
    return <div>Loading chess game...</div>;
  }

  return <ChessGameContext.Provider value={value}>{children}</ChessGameContext.Provider>;
}
```

## Debugging Hydration Errors

### 1. **Use React DevTools**
- Install React Developer Tools browser extension
- Check the Components tab for hydration warnings
- Look for components with red borders indicating hydration mismatches

### 2. **Check Console for Specific Errors**
```typescript
// Look for errors like:
Warning: Text content did not match. Server: "Loading..." Client: "White to move"
Warning: Prop `className` did not match. Server: "board-light" Client: "board-dark"
```

### 3. **Use suppressHydrationWarning Sparingly**
```typescript
// ⚠️ ONLY use when you're certain the mismatch is harmless
<div suppressHydrationWarning>
  {contentThatMightDifferSlightly}
</div>
```

### 4. **Add Debug Logging**
```typescript
useEffect(() => {
  console.log('Component mounted on client');
  console.log('Window object available:', typeof window !== 'undefined');
  console.log('Initial game state:', game?.fen());
}, []);
```

## Testing for Hydration Issues

### 1. **SSR Testing**
```typescript
// Test server-side rendering
npm run build
npm run start
```

### 2. **Client-Side Navigation Testing**
```typescript
// Test client-side navigation
npm run dev
// Navigate between pages and check for hydration errors
```

### 3. **Environment Testing**
```typescript
// Test different environments
- Development (npm run dev)
- Production build (npm run build && npm run start)
- Static export (if applicable)
```

## Common Hydration Error Patterns and Fixes

### Pattern 1: Theme Mismatch
```typescript
// Problem: Different theme detection on server vs client
const [theme, setTheme] = useState(
  typeof window !== 'undefined'
    ? localStorage.getItem('theme') || 'light'
    : 'light'
);

// Solution: Use consistent initial value
const [theme, setTheme] = useState('light');
useEffect(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) setTheme(savedTheme);
}, []);
```

### Pattern 2: Dynamic Classes
```typescript
// Problem: Dynamic CSS classes based on browser state
<div className={window.innerWidth > 768 ? 'large' : 'small'}>

// Solution: Use CSS media queries or state management
const [isLarge, setIsLarge] = useState(false);
useEffect(() => {
  setIsLarge(window.innerWidth > 768);
}, []);
```

### Pattern 3: Random or Time-Based Content
```typescript
// Problem: Different random values on server vs client
const [gameId] = useState(Math.random().toString(36));

// Solution: Generate on client side only
const [gameId, setGameId] = useState('');
useEffect(() => {
  setGameId(Math.random().toString(36));
}, []);
```

## Best Practices for Chess Components

### 1. **Always Use "use client" Directive**
```typescript
"use client";

// All chess components should be client components
```

### 2. **Implement Loading States**
```typescript
if (!mounted || !game) {
  return (
    <div className="flex items-center justify-center">
      <div>Loading chess board...</div>
    </div>
  );
}
```

### 3. **Use Context for Complex State**
```typescript
// Use context provider for game state, not just useState
const { state, makeMove, resetGame } = useChessGame();
```

### 4. **Handle Edge Cases**
```typescript
// Always check for browser availability
if (typeof window === "undefined") return null;

// Handle chess.js errors gracefully
try {
  const game = new Chess(fen);
  setGame(game);
} catch (error) {
  console.error('Invalid FEN:', error);
  setGame(new Chess()); // Fall back to starting position
}
```

## Quick Checklist for Hydration Issues

- [ ] All chess components have "use client" directive
- [ ] Window/localStorage access wrapped in useEffect or typeof checks
- [ ] Default values provided for all state
- [ ] Loading states implemented for async operations
- [ ] Chess.js initialized properly with error handling
- [ ] No random/time-based values in initial render
- [ ] CSS classes consistent between server and client
- [ ] Context providers handle mounting state
- [ ] Error boundaries implemented for graceful fallbacks
- [ ] Tested in both development and production builds

## What to Do If You Still Get Hydration Errors

1. **Check the exact error message** in browser console
2. **Identify the component** causing the issue (React DevTools helps)
3. **Look for state mismatches** between server and client
4. **Add temporary suppressHydrationWarning** to isolate the issue
5. **Implement proper loading states** or consistent initial values
6. **Test thoroughly** in different environments

## Resources for Further Reading

- [React Docs: Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Next.js Docs: Common Errors](https://nextjs.org/docs/messages/react-hydration-error)
- [React 18 Docs: Suspense and SSR](https://react.dev/blog/2022/03/29/react-v18#new-suspense-features-on-the-server)

---

If you encounter hydration errors with the chess components, this guide should help you identify and fix the most common causes. The provided chess components are designed to be hydration-safe by following these patterns.