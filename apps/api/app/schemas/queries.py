import strawberry
from typing import List

from app.schemas.types import UserType, GameType, ConceptType


@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello from Elucidate Chess API!"

    @strawberry.field
    def users(self) -> List[UserType]:
        # Placeholder - will implement with database
        return []

    @strawberry.field
    def games(self) -> List[GameType]:
        # Placeholder - will implement with database
        return []

    @strawberry.field
    def concepts(self) -> List[ConceptType]:
        # Placeholder - will implement with database
        return []
