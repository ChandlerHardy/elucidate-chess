# FastAPI Development Skill

**Purpose:** Expert guidance for FastAPI application development with best practices, performance optimization, and production deployment patterns.

## When to Use This Skill

- Building FastAPI backends and APIs
- Implementing RESTful services
- Setting up GraphQL endpoints
- Database integration with SQLAlchemy
- Authentication and authorization
- API testing and documentation
- Performance optimization
- Production deployment

## Key Topics Covered

### Core FastAPI Development
- **Project Structure**: Best practices for organizing FastAPI applications
- **Pydantic Models**: Request/response validation and serialization
- **Dependency Injection**: Clean dependency management
- **Middleware**: Custom middleware for cross-cutting concerns
- **Error Handling**: Consistent error responses and logging

### Database Integration
- **SQLAlchemy Setup**: ORM configuration and migrations
- **Database Models**: Best practices for model design
- **Relationships**: Efficient database relationships
- **Query Optimization**: Performance-tuned database queries
- **Connection Pooling**: Database connection management

### API Design Patterns
- **RESTful APIs**: Resource-oriented endpoint design
- **GraphQL Integration**: Strawberry GraphQL setup
- **Versioning**: API version management strategies
- **Pagination**: Efficient data pagination
- **Filtering and Sorting**: Advanced query capabilities

### Authentication & Security
- **JWT Authentication**: Secure token-based auth
- **OAuth2 Integration**: Social login providers
- **API Security**: Rate limiting, CORS, security headers
- **Permission Systems**: Role-based access control
- **Data Validation**: Input sanitization and validation

## Resources

### Core FastAPI Patterns
- `project-structure.md` - Application organization and best practices
- `pydantic-models.md` - Request/response modeling and validation
- `dependency-injection.md` - Clean dependency management patterns
- `error-handling.md` - Consistent error handling and logging

### Database Integration
- `sqlalchemy-setup.md` - ORM configuration and connection management
- `model-design.md` - Database model best practices and relationships
- `query-optimization.md` - Performance-tuned database queries
- `migrations.md` - Alembic migration patterns

### API Development
- `rest-api-design.md` - RESTful endpoint design patterns
- `graphql-integration.md` - Strawberry GraphQL setup and best practices
- `testing-strategies.md` - API testing with pytest and TestClient
- `documentation.md` - OpenAPI/Swagger documentation optimization

### Production Deployment
- `performance.md` - FastAPI performance optimization
- `deployment.md` - Production deployment with Docker and containers
- `monitoring.md` - Application monitoring and logging
- `scaling.md` - Horizontal scaling strategies

## Quick Start

For FastAPI development tasks, this skill provides:
- Project structure templates and best practices
- Database integration patterns with SQLAlchemy
- API design guidelines for REST and GraphQL
- Authentication and security implementation patterns
- Performance optimization techniques
- Production deployment strategies

Use the resources above for detailed implementation guidance on specific FastAPI development topics.

## Common Patterns

### Project Structure
```
app/
├── __init__.py
├── main.py                 # FastAPI application entry
├── api/                    # API route definitions
│   ├── __init__.py
│   ├── deps.py            # Dependencies
│   └── v1/                # API versioning
│       ├── __init__.py
│       ├── endpoints/     # Route definitions
│       └── schemas.py     # Pydantic models
├── core/                  # Core application logic
│   ├── config.py          # Configuration
│   ├── security.py        # Authentication
│   └── database.py        # Database setup
├── models/                # SQLAlchemy models
├── services/              # Business logic
├── schemas/               # Pydantic models
└── tests/                 # Test suite
```

### FastAPI Application Setup
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)
```

### Dependency Injection Pattern
```python
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.user_service import UserService

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)

# Usage in endpoints
@app.post("/users/")
async def create_user(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    return user_service.create_user(user_data)
```

This skill provides comprehensive guidance for building production-ready FastAPI applications with modern Python development practices.