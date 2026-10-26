const { app, output } = require('@azure/functions');
const { randomUUID } = require('node:crypto');

// Cada pedido del CSV se envía como un mensaje a la cola "pedidos".
const colaPedidos = output.storageQueue({
  queueName: 'pedidos',
  connection: 'DATOS'
});

// Se ejecuta cuando llega un archivo al contenedor "entrada".
// Event Grid avisa a la función que el archivo se creó.
app.storageBlob('cargarPedidos', {
  path: 'entrada/{name}',
  connection: 'DATOS',
  source: 'EventGrid',
  return: colaPedidos,
  handler: (archivo, context) => {
    const nombre = context.triggerMetadata.name;
    const filas = archivo.toString('utf8').split(/\r?\n/);
    const pedidos = [];

    // La fila 1 es el encabezado (cliente,producto,cantidad). Las filas vacías se ignoran.
    filas.forEach((texto, i) => {
      if (i === 0 || texto.trim() === '') return;
      const [cliente, producto, cantidad] = texto.split(',').map((valor) => valor.trim());
      pedidos.push({ id: randomUUID(), archivo: nombre, fila: i + 1, cliente, producto, cantidad });
    });

    context.log(`${nombre}: ${pedidos.length} pedidos enviados a la cola`);
    return pedidos;
  }
});
