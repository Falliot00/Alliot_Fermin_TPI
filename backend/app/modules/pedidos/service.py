from datetime import datetime, timedelta
from math import isfinite
from zoneinfo import ZoneInfo

from app.modules.productos.service import producto_activo
from app.modules.usuarios.models import Role
from app.modules.usuarios.schemas import UserPublic

from .models import DetallePedido, EstadoPedido, Pedido, ahora
from .schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .unit_of_work import PedidoUnitOfWork

TRANSICIONES = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}
ZONA_NEGOCIO = ZoneInfo("America/Argentina/Buenos_Aires")


class PedidoNoEncontrado(Exception):
    def __init__(self):
        super().__init__("Pedido no encontrado.")


class PedidoAjeno(Exception):
    def __init__(self):
        super().__init__("Este pedido pertenece a otro usuario.")


class ReglaPedido(Exception):
    pass


class StockInsuficiente(ReglaPedido):
    def __init__(self, nombre: str, stock: int):
        super().__init__(f"Stock insuficiente para {nombre}. Disponibles: {stock}.")


class ProductoNoDisponible(ReglaPedido):
    def __init__(self, nombre: str):
        super().__init__(f"{nombre} no está disponible.")


class ProductoRepetido(ReglaPedido):
    def __init__(self):
        super().__init__("No se permiten productos repetidos en el pedido.")


class TransicionInvalida(ReglaPedido):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def crear(self, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            if len({item.producto_id for item in data.items}) != len(data.items):
                raise ProductoRepetido()
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )

            # Compras y cancelaciones bloquean productos por ID ascendente.
            for item in sorted(data.items, key=lambda item: item.producto_id):
                producto = producto_activo(uow.productos, item.producto_id, for_update=True)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock)
                producto.stock -= item.cantidad
                subtotal = producto.precio_base * item.cantidad
                pedido.items.append(
                    DetallePedido(
                        producto_id=item.producto_id,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        cantidad=item.cantidad,
                        subtotal=subtotal,
                    )
                )
                pedido.total += subtotal
            if not isfinite(pedido.total):
                raise ReglaPedido("El total del pedido excede el rango admitido.")
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: UserPublic, estado: EstadoPedido | None, skip: int, limit: int
    ) -> PedidosPaginados:
        with self.uow as uow:
            autor = None if usuario.role == Role.ADMIN else usuario.id
            total, pedidos = uow.pedidos.list_by_usuario(autor, estado, skip, limit)
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(pedido) for pedido in pedidos]
            )

    def obtener(self, id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, id)
            if usuario.role != Role.ADMIN and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, id: int, estado: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, id, for_update=True)
            self._transicionar(uow, pedido, estado)
            return PedidoRead.model_validate(pedido)

    def cancelar_propio(self, id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, id, for_update=True)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != EstadoPedido.PENDIENTE:
                raise TransicionInvalida("Solo podés cancelar un pedido pendiente.")
            self._transicionar(uow, pedido, EstadoPedido.CANCELADO)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            inicio = datetime.now(ZONA_NEGOCIO).replace(hour=0, minute=0, second=0, microsecond=0)
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos.get(EstadoPedido.PENDIENTE, 0),
                en_preparacion=conteos.get(EstadoPedido.EN_PREPARACION, 0),
                entregados=conteos.get(EstadoPedido.ENTREGADO, 0),
                cancelados=conteos.get(EstadoPedido.CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_entre(inicio, inicio + timedelta(days=1)),
                ingresos_entregados=uow.pedidos.total_por_estado(EstadoPedido.ENTREGADO),
            )

    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, id: int, *, for_update: bool = False) -> Pedido:
        pedido = uow.pedidos.get_by_id(id, for_update=for_update)
        if pedido is None:
            raise PedidoNoEncontrado()
        return pedido

    @staticmethod
    def _transicionar(uow: PedidoUnitOfWork, pedido: Pedido, estado: EstadoPedido) -> None:
        if estado not in TRANSICIONES[EstadoPedido(pedido.estado)]:
            raise TransicionInvalida(
                f"No se puede cambiar el estado de {pedido.estado} a {estado}."
            )
        if estado == EstadoPedido.CANCELADO:
            for item in sorted(pedido.items, key=lambda item: item.producto_id):
                # El producto puede haber sido dado de baja desde la compra.
                producto = uow.productos.get_by_id(item.producto_id, for_update=True)
                assert producto is not None
                producto.stock += item.cantidad
        pedido.estado = estado
        pedido.updated_at = ahora()
