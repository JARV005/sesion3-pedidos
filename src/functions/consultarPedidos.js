const { app, input } = require('@azure/functions');

// Lee de la tabla "pedidos" las filas del cliente que llega en la ruta.
const pedidosDelCliente = input.table({
  tableName: 'pedidos',
  partitionKey: '{cliente}',
  take: 100,
  connection: 'DATOS'
});

// GET /api/pedidos/{cliente}
app.http('consultarPedidos', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'pedidos/{cliente}',
  extraInputs: [pedidosDelCliente],
  handler: (request, context) => {
    const filas = context.extraInputs.get(pedidosDelCliente) || [];
    const pedidos = filas.map((f) => ({
      id: f.RowKey ?? f.rowKey,
      producto: f.producto,
      cantidad: f.cantidad,
      total: f.total,
      archivo: f.archivo
    }));

    return {
      jsonBody: {
        cliente: request.params.cliente,
        pedidos: pedidos.length,
        total: pedidos.reduce((suma, p) => suma + Number(p.total || 0), 0),
        detalle: pedidos
      }
    };
  }
});
