# Food Store

Trabajo Práctico Integrador de Programación IV · Fermín Alliot

Food Store permite consultar un catálogo de comidas, armar un carrito y hacer pedidos con entrega y pago manual. El panel de administración gestiona categorías, productos, stock, pedidos y usuarios.

- [Repositorio público de GitHub (CE-01)](https://github.com/Falliot00/Alliot_Fermin_TPI)
- Video público de 10 a 15 minutos (CE-07) — pendiente de grabación y publicación.

## Requisitos

- Python 3.11 a 3.13. Desarrollo verificado con Python 3.12.
- PostgreSQL 15 o superior, con una base dedicada. Usá una base UTF-8 con configuración regional compatible con la búsqueda de nombres con tildes.
- Node.js 22.13 o superior y pnpm 11.17.0. El proyecto fija esta versión de pnpm en `package.json`.

## 1. Base de datos

En `psql`, conectado como administrador a PostgreSQL, ejecutá lo siguiente una vez. El comando `\password` pide una contraseña local para el rol `foodstore`.

```sql
CREATE ROLE foodstore LOGIN;
\password foodstore
CREATE DATABASE foodstore_tpi OWNER foodstore;
```

Usá el nombre y el puerto de tu base en `DATABASE_URL`. Si la contraseña contiene caracteres reservados en una URL, codificalos antes de incorporarla.

## 2. Backend

Desde la raíz, en una terminal PowerShell:

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

En macOS o Linux, usá `python3.12 -m venv .venv`, `source .venv/bin/activate` y `cp .env.example .env`. Si usás otra versión de Python admitida, ajustá el comando de creación del entorno.

Editá `backend/.env` con tu conexión a PostgreSQL y una clave JWT aleatoria. Podés generar la clave con `python -c "import secrets; print(secrets.token_hex(32))"`. Luego, desde `backend/`:

```sh
python -m app.db.seed
uvicorn app.main:app --host localhost --port 8000
```

El seed crea la cuenta `admin`, tres categorías y nueve productos con stock. Ejecutalo antes de abrir el registro público. Si lo volvés a ejecutar sobre el catálogo inicial, conserva los registros y el stock existente.

- Usuario de administración local: `admin`
- Contraseña del seed: `Admin1234!`

La API tiene el prefijo `/api/v1`. La documentación está disponible en [Swagger UI](http://localhost:8000/docs) y [ReDoc](http://localhost:8000/redoc). En Swagger, ejecutá primero `POST /api/v1/auth/token` si querés probar rutas protegidas desde el navegador.

## 3. Frontend

Desde la raíz, en otra terminal:

```powershell
cd frontend
Copy-Item .env.example .env
pnpm install
pnpm build
pnpm dev
```

En macOS o Linux, usá `cp .env.example .env`. En Windows, extraé el ZIP en una carpeta local corta, por ejemplo `C:\Proyectos\FoodStore`. En Google Drive para escritorio, pnpm puede fallar al crear los enlaces de dependencias. Abrí [Food Store](http://localhost:5173). Usá `localhost` en ambos servicios para que el navegador envíe la cookie de sesión. Cuando cambies el origen de la interfaz, actualizá también `FRONTEND_ORIGIN`. Las imágenes del seed se sirven por URL y la interfaz muestra la categoría si una imagen falla.

## Variables de entorno

| Archivo | Variable | Uso |
| --- | --- | --- |
| `backend/.env` | `DATABASE_URL` | Conexión PostgreSQL. Ejemplo `postgresql://foodstore:contraseña-local@localhost:5432/foodstore_tpi`. |
| `backend/.env` | `SECRET_KEY` | Clave aleatoria de al menos 32 caracteres para firmar la sesión. |
| `backend/.env` | `ALGORITHM` | Algoritmo del JWT. Valor local `HS256`. |
| `backend/.env` | `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión en minutos. Valor `30`. |
| `backend/.env` | `FRONTEND_ORIGIN` | Origen CORS autorizado. Valor local `http://localhost:5173`. |
| `backend/.env` | `COOKIE_SECURE` | `false` para HTTP local y `true` para HTTPS. |
| `frontend/.env` | `VITE_API_URL` | URL de la API con prefijo. Valor local `http://localhost:8000/api/v1`. |

## Recorrido para el video

1. **0–2 min.** Con la cámara encendida, presentate y mostrá la finalidad del sistema. Abrí el catálogo sin sesión, buscá un producto, filtrá por categoría y mostrá la paginación.
2. **2–5 min.** Agregá productos al carrito y recargá para mostrar que se conserva. Pasá al checkout, registrá una cuenta de cliente y confirmá el pedido con dirección y forma de pago. Abrí su detalle en **Mis pedidos**.
3. **5–9 min.** Ingresá como `admin` en otra ventana. Mostrá el resumen, creá o editá una categoría y un producto, cambiá stock o disponibilidad y mostrá la activación y desactivación de usuarios. Pasá un pedido de pendiente a en preparación y luego a entregado.
4. **9–12 min.** Prepará un segundo pedido y anotá el stock descontado en **Administración → Productos**. Cancelalo desde **Mis pedidos** mientras está pendiente. Actualizá el panel y mostrá que el stock subió exactamente la cantidad comprada. Cerrá con `/docs` y el README raíz.
