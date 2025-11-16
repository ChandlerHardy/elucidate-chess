import strawberry

from app.schemas.types import UserType, GameType


@strawberry.type
class Mutation:
    @strawberry.mutation
    def placeholder_mutation(self) -> str:
        return "Mutations will be implemented here"
