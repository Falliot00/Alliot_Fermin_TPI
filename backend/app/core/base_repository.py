from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

Model = TypeVar("Model", bound=SQLModel)


class BaseRepository(Generic[Model]):
    """Acceso a datos sobre la sesión que administra el Unit of Work."""

    def __init__(self, session: Session, model: type[Model]):
        self.session = session
        self.model = model

    def get_by_id(self, id: int, *, for_update: bool = False) -> Model | None:
        return self.session.get(self.model, id, with_for_update=for_update)

    def get_all(self) -> list[Model]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, entity: Model) -> Model:
        self.session.add(entity)
        self.session.flush()
        return entity

    def delete(self, entity: Model) -> None:
        self.session.delete(entity)
