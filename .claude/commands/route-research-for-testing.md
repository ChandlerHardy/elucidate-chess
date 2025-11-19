# /route-research-for-testing Command

**Purpose:** Auto-discover API routes and generate comprehensive testing documentation for FastAPI endpoints.

## Usage
```
/route-research-for-testing [service-name]
```

## What It Does

### Route Discovery
- Scans FastAPI application for all endpoints
- Extracts HTTP methods, paths, and parameters
- Documents request/response schemas
- Identifies authentication requirements

### Test Generation
- Creates valid request examples
- Generates invalid test cases
- Documents expected responses
- Creates error scenario tests

### Integration Testing
- Provides curl commands for manual testing
- Generates pytest test templates
- Documents authentication flows
- Creates integration test scenarios

## FastAPI Integration

### Route Discovery Process
```python
# Analyzes FastAPI app structure
from fastapi import FastAPI
from fastapi.routing import APIRoute

def discover_routes(app: FastAPI):
    routes = []
    for route in app.routes:
        if isinstance(route, APIRoute):
            routes.append({
                "path": route.path,
                "methods": list(route.methods),
                "summary": route.summary,
                "tags": route.tags,
                "parameters": extract_parameters(route),
                "responses": extract_responses(route)
            })
    return routes
```

### Test Documentation Output
```json
{
  "route": "/api/chess/analyze",
  "method": "POST",
  "description": "Analyze chess position with engine and AI",
  "parameters": {
    "fen": "string (required) - Chess position in FEN format",
    "depth": "integer (optional) - Analysis depth, default 20",
    "include_explanation": "boolean - Generate AI explanation"
  },
  "valid_example": {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "depth": 20,
    "include_explanation": true
  },
  "test_cases": [
    {
      "name": "valid_position",
      "request": {"fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"},
      "expected_status": 200
    },
    {
      "name": "invalid_fen",
      "request": {"fen": "invalid-fen"},
      "expected_status": 400
    }
  ]
}
```

## Integration Workflow

### 1. Route Analysis
```bash
# Discover all routes in chess API
/route-research-for-testing chess-api

# Discover specific service routes
/route-research-for-testing authentication-service
```

### 2. Test Generation
The command generates:
- **Test Documentation**: Complete API reference
- **curl Commands**: For manual testing
- **Pytest Templates**: Automated test scaffolding
- **Postman Collections**: Import-ready API tests

### 3. Authentication Testing
```bash
# Generate auth test cases
curl -X POST "http://localhost:8002/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "test@example.com", "password": "password"}'

# Test protected routes
curl -X GET "http://localhost:8002/api/chess/games" \
  -H "Authorization: Bearer JWT_TOKEN"
```

## Output Files

Generated documentation structure:
```
dev/testing/
├── api-routes.md           # Complete API documentation
├── test-examples.md        # Request/response examples
├── curl-commands.md        # Manual testing scripts
└── pytest-templates/      # Automated test templates
    ├── test_auth.py
    ├── test_chess.py
    └── test_users.py
```

## When to Use

- **API Development**: Document new endpoints as you build them
- **Testing Preparation**: Generate test cases before QA
- **API Reviews**: Create comprehensive API documentation
- **Integration Planning**: Prepare for frontend-backend integration
- **Documentation Updates**: Keep API docs in sync with code

## Integration with Development

### FastAPI Route Enhancement
```python
# Enhanced route definitions for better documentation
@app.post("/api/chess/analyze",
          summary="Analyze Chess Position",
          description="Analyze position using Stockfish engine and AI explanations",
          tags=["chess", "analysis"],
          responses={
              200: {"description": "Position analysis completed"},
              400: {"description": "Invalid FEN format"},
              429: {"description": "Rate limit exceeded"}
          })
async def analyze_position(request: AnalysisRequest):
    pass
```

### Test Generation Integration
```python
# Generated test template
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_position_valid():
    response = client.post("/api/chess/analyze", json={
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        "depth": 20
    })
    assert response.status_code == 200
    assert "evaluation" in response.json()
```

## Benefits

- **Comprehensive Coverage**: Ensures all endpoints are documented and tested
- **Consistent Testing**: Standardized test patterns across all APIs
- **Living Documentation**: Auto-syncs with code changes
- **Integration Ready**: Provides everything needed for frontend integration
- **QA Acceleration**: Jumpstarts testing processes

This command transforms your FastAPI routes into comprehensive, testable documentation perfect for development, testing, and integration workflows.