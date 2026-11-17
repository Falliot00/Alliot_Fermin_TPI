from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository

from .models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def list_activas(self) -> list[Categoria]:
        query = select(Categoria).where(col(Categoria.activo).is_(True)).order_by(Categoria.nombre)
        return list(self.session.exec(query).all())

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        query = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(query).first()
