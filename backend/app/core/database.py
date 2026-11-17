from sqlmodel import Session, SQLModel, create_engine

from app.core.config import get_settings

engine = create_engine(get_settings().database_url, pool_pre_ping=True)


def session_factory() -> Session:
    return Session(engine)


def create_all_tables() -> None:
    # Importar los modelos antes de configurar los mapeos y crear las tablas.
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido, Pedido
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario

    SQLModel.metadata.create_all(
        engine,
        tables=[model.__table__ for model in (Usuario, Categoria, Producto, Pedido, DetallePedido)],
    )
