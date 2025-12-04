from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
import logging

from app.core.config import settings
from app.schemas.schema import schema
from app.services.engine import get_engine_service, shutdown_engine_service

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Elucidate Chess API",
    description="AI-powered chess analysis and learning platform",
    version="0.1.0",
)


# Application lifecycle events
@app.on_event("startup")
async def startup_event():
    """Initialize services on application startup"""
    logger.info("Starting Elucidate Chess API...")
    try:
        # Start chess engine
        engine = await get_engine_service()
        logger.info("Stockfish engine initialized successfully")
    except Exception as e:
        logger.error(f"Failed to start engine: {e}")
        # Continue anyway - engine will be started on first request


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup services on application shutdown"""
    logger.info("Shutting down Elucidate Chess API...")
    await shutdown_engine_service()
    logger.info("Engine stopped successfully")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/chess/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "elucidate-chess",
        "version": "1.0.0",
        "environment": settings.environment
    }

# GraphQL endpoint
async def get_context():
    return {}

graphql_app = GraphQLRouter(schema, context_getter=get_context)
app.include_router(graphql_app, prefix="/chess/graphql")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
