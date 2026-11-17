from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository

from .models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_by_categoria_y_nombre(self, categoria_id: int, nombre: str) -> Producto | None:
        query = select(Producto).where(
            Producto.categoria_id == categoria_id, Producto.nombre == nombre
        )
        return self.session.exec(query).first()

    def search(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> tuple[int, list[Producto]]:
        consulta = select(Producto).where(col(Producto.activo).is_(True))
        if search:
            consulta = consulta.where(col(Producto.nombre).icontains(search, autoescape=True))
        if categoria_id is not None:
            consulta = consulta.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            consulta = consulta.where(col(Producto.disponible).is_(disponible))
        total = self.session.exec(select(func.count()).select_from(consulta.subquery())).one()
        pagina = consulta.options(selectinload(Producto.categoria)).order_by(Producto.id)
        return total, list(self.session.exec(pagina.offset(skip).limit(limit)).all())
