const { app, output } = require('@azure/functions');

// Precio por unidad, en pesos colombianos.
const PRECIOS = { cafe: 18000, te: 12000, chocolate: 15000 };

// Guarda el pedido en la tabla "pedidos".
const tablaPedidos = output.table({
  tableName: 'pedidos',
  connection: 'DATOS'
});

// Guarda un recibo .json en el contenedor "recibos". {rand-guid} le da un nombre único.
const recibo = output.storageBlob({
  path: 'recibos/{rand-guid}.json',
  connection: 'DATOS'
});

// Se ejecuta por cada mensaje que llega a la cola "pedidos".
app.storageQueue('procesarPedido', {
  queueName: 'pedidos',
  connection: 'DATOS',
  extraOutputs: [tablaPedidos, recibo],
  handler: (pedido, context) => {
    const precio = PRECIOS[pedido.producto];
    const cantidad = Number(pedido.cantidad);

    // Si el pedido no es válido, la función falla. Azure lo reintenta
    // y, después de 5 intentos, lo mueve a la cola "pedidos-poison".
    if (!/^[a-z0-9-]{1,40}$/.test(pedido.cliente || '')) {
      throw new Error(`Cliente inválido en ${pedido.archivo}, fila ${pedido.fila}`);
    }
    if (precio === undefined) {
      throw new Error(`Producto desconocido "${pedido.producto}" en ${pedido.archivo}, fila ${pedido.fila}`);
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 100) {
      throw new Error(`Cantidad inválida "${pedido.cantidad}" en ${pedido.archivo}, fila ${pedido.fila}`);
    }

    const fila = {
      PartitionKey: pedido.cliente,
      RowKey: pedido.id,
      producto: pedido.producto,
      cantidad,
      total: precio * cantidad,
      archivo: pedido.archivo
    };

    context.extraOutputs.set(tablaPedidos, fila);
    context.extraOutputs.set(recibo, JSON.stringify({ ...fila, procesado: new Date().toISOString() }, null, 2));
    context.log(`Pedido ${pedido.id}: ${pedido.cliente} compró ${cantidad} ${pedido.producto} por ${fila.total}`);
  }
});
