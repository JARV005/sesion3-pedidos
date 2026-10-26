# Sesión 3 · Functions y Storage

Código de la práctica de la sesión 3 de Azure. Crea tu propio repositorio con el botón **Use this template** y sigue la guía de la sesión que te compartió tu TL.

## Qué hace

1. Subes un archivo `.csv` al contenedor `entrada` de tu cuenta de almacenamiento.
2. Event Grid avisa a la función `cargarPedidos`, que envía cada fila del archivo a la cola `pedidos`.
3. La función `procesarPedido` toma cada mensaje, calcula el total, guarda el pedido en la tabla `pedidos` y deja un recibo en el contenedor `recibos`. Si un pedido falla 5 veces, va a la cola `pedidos-poison`.
4. La función `consultarPedidos` responde `GET /api/pedidos/{cliente}` con los pedidos de ese cliente.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `src/functions/cargarPedidos.js` | Se ejecuta cuando llega un `.csv` a `entrada` |
| `src/functions/procesarPedido.js` | Se ejecuta por cada mensaje de la cola `pedidos` |
| `src/functions/consultarPedidos.js` | API `GET /api/pedidos/{cliente}` |
| `host.json` | Configuración del host de Functions. `messageEncoding: none` guarda los mensajes de la cola como texto, para que puedas leerlos en el portal |
| `package.json` y `package-lock.json` | Dependencia `@azure/functions` |
| `datos-prueba/` | Archivos para subir al contenedor `entrada` durante la práctica |

## Lo que necesita la Function App

- Plan **Flex Consumption**, Node.js 22 o 24.
- Una variable de entorno llamada `DATOS` con la cadena de conexión de la cuenta de almacenamiento de datos. Esa cuenta debe tener los contenedores `entrada` y `recibos`, la cola `pedidos` y la tabla `pedidos`.
- Una suscripción de Event Grid en esa cuenta que llame a `cargarPedidos` cuando se crea un `.csv` en `entrada`.

## Despliegue

Cuando creas la Function App en el portal y conectas este repositorio en la pestaña **Deployment**, Azure agrega un workflow en `.github/workflows/`. Desde ese momento, cada cambio que guardes en la rama `main` se publica solo con GitHub Actions.
