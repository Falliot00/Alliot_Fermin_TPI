from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Role, Usuario
from app.modules.usuarios.repository import UsuarioRepository

CATEGORIAS = (
    ("Hamburguesas", "Hamburguesas y sándwiches hechos a la plancha."),
    ("Pizzas", "Masa de fermentación lenta, horneada a la piedra."),
    ("Acompañamientos", "Porciones para sumar a tu pedido."),
)

PRODUCTOS = (
    (
        0,
        "Hamburguesa clásica",
        "Carne, cheddar, lechuga y tomate.",
        8500,
        18,
        "1568901346375-23c9450c58cd",
    ),
    (
        0,
        "Doble cheddar",
        "Doble medallón, cheddar y cebolla a la plancha.",
        11200,
        12,
        "1550547660-d9450f859349",
    ),
    (
        0,
        "Hamburguesa de pollo",
        "Pollo crocante, repollo y mayonesa de limón.",
        8900,
        16,
        "1606755962773-d324e0a13086",
    ),
    (
        1,
        "Pizza margherita",
        "Salsa de tomate, mozzarella y albahaca fresca.",
        10500,
        10,
        "1574071318508-1cdbab80d002",
    ),
    (
        1,
        "Pizza de pepperoni",
        "Mozzarella y pepperoni sobre salsa de tomate.",
        12500,
        10,
        "1628840042765-356cda07504e",
    ),
    (
        1,
        "Pizza de la casa",
        "Mozzarella, tomates y aceitunas negras.",
        11900,
        9,
        "1513104890138-7c749659a591",
    ),
    (2, "Papas fritas", "Papas doradas y sal marina.", 4100, 24, "1573080496219-bb080dd4f877"),
    (
        2,
        "Ensalada fresca",
        "Hojas verdes, tomates y vinagreta cítrica.",
        4900,
        12,
        "1512621776951-a57141f2eefd",
    ),
    (
        2,
        "Papas rústicas",
        "Papas al horno con especias y hierbas.",
        4900,
        14,
        "1518013431117-eb1465fa5752",
    ),
)


def main() -> None:
    create_all_tables()
    with ProductoUnitOfWork() as uow:
        usuarios = UsuarioRepository(uow.session)
        if usuarios.get_by_username("admin") is None:
            usuarios.add(
                Usuario(
                    username="admin",
                    full_name="Administración Food Store",
                    email="admin@foodstore.com",
                    hashed_password=hash_password("Admin1234!"),
                    role=Role.ADMIN,
                )
            )

        categorias = []
        for nombre, descripcion in CATEGORIAS:
            categoria = uow.categorias.get_by_nombre(nombre)
            if categoria is None:
                categoria = uow.categorias.add(Categoria(nombre=nombre, descripcion=descripcion))
            categorias.append(categoria)

        for indice, nombre, descripcion, precio, stock, foto in PRODUCTOS:
            categoria_id = categorias[indice].id
            assert categoria_id is not None
            if uow.productos.get_by_categoria_y_nombre(categoria_id, nombre) is None:
                uow.productos.add(
                    Producto(
                        categoria_id=categoria_id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        imagen_url=f"https://images.unsplash.com/photo-{foto}?auto=format&fit=crop&w=720&q=80",
                    )
                )
    print("Seed de Food Store listo.")


if __name__ == "__main__":
    main()
