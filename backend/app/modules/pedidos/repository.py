from datetime import datetime

from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository

from .models import EstadoPedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def list_by_usuario(
        self, usuario_id: int | None, estado: EstadoPedido | None, skip: int, limit: int
    ) -> tuple[int, list[Pedido]]:
        consulta = select(Pedido)
        if usuario_id is not None:
            consulta = consulta.where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            consulta = consulta.where(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(consulta.subquery())).one()
        pagina = consulta.options(selectinload(Pedido.items)).order_by(Pedido.id.desc())
        return total, list(self.session.exec(pagina.offset(skip).limit(limit)).all())

    def count_by_estado(self) -> dict[str, int]:
        query = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        return dict(self.session.exec(query).all())

    def count_entre(self, inicio: datetime, fin: datetime) -> int:
        query = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= inicio, Pedido.created_at < fin)
        )
        return self.session.exec(query).one()

    def total_por_estado(self, estado: EstadoPedido) -> float:
        query = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(Pedido.estado == estado)
        return self.session.exec(query).one()
