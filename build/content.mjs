// Editorial content derived strictly from the original store's published policies
// (https://papeleraavellaneda.com/envios-y-devoluciones/ and /contacto/).
export function faqs(site) {
  const c = site.contact;
  return [
    { q: '¿Cuánto tarda en llegar mi pedido?', a: `<p>Depende del medio de envío que elijas:</p><ul><li><strong>Envío estándar por Correo Argentino:</strong> dentro de los 10 días hábiles posteriores a tu compra, a domicilio o a sucursal.</li><li><strong>Moto CABA:</strong> de 2 a 5 días hábiles una vez acreditado el pedido.</li><li><strong>Moto Flash CABA:</strong> tu pedido se envía al día siguiente.</li></ul>` },
    { q: '¿Hacen envíos a todo el país?', a: '<p>Sí. Los pedidos se entregan a través de Correo Argentino en toda la República Argentina. Podés elegir recibirlo en tu domicilio o en cualquier sucursal del correo.</p>' },
    { q: '¿Puedo retirar mi pedido en el local?', a: `<p>Sí, en ${c.address}, CABA. Con <strong>retiro estándar</strong> tu pedido está listo en 2 a 5 días hábiles y te avisamos cuando puedas pasar; con <strong>retiro flash</strong> queda listo al día siguiente y te confirmamos el horario.</p><p>Los retiros son de ${c.pickup_hours.toLowerCase()}. Se entregan con el número de pedido y el nombre de quien hizo la compra (o de la persona que indicaste para retirar).</p>` },
    { q: '¿Cuánto cuesta el envío?', a: '<p>El costo de envío se indica durante la compra, antes de finalizar el pedido, y corre por cuenta del cliente.</p>' },
    { q: '¿Qué medios de pago aceptan?', a: `<ul><li><strong>Mercado Pago</strong> — tarjetas de crédito y débito, con hasta ${site.installments_no_interest} cuotas sin interés.</li><li><strong>Transferencia o depósito bancario.</strong></li><li><strong>Efectivo.</strong></li></ul>` },
    { q: '¿Puedo hacer el seguimiento de mi pedido?', a: '<p>Sí. Te enviamos un mensaje con un código de seguimiento (tracking number) y las instrucciones para seguir tu pedido.</p>' },
    { q: '¿Puedo cambiar o devolver un producto?', a: `<p>Sí, dentro de los ${site.returns_days} días posteriores a la recepción del pedido. El artículo tiene que estar en su estado original, sin usar y con sus etiquetas y envoltorios. Incluí la factura original para agilizar el proceso. El costo de envío de la devolución corre por cuenta del cliente; si el producto llegó defectuoso o dañado, lo cubre la tienda.</p>` },
    { q: '¿Qué pasa si no hay nadie cuando llega el pedido?', a: '<p>Si no hay nadie en el domicilio, el correo vuelve a las 48 horas. Si tampoco encuentra a nadie, tenés que acercarte al centro de distribución asignado dentro de las 72 horas con tu DNI y el código de seguimiento. Tu pedido puede recibirlo cualquier persona mayor de 18 años que esté en el domicilio.</p>' },
    { q: '¿Cómo me comunico con ustedes?', a: `<p>Por WhatsApp al <a href="https://wa.me/${c.whatsapp}" target="_blank" rel="noopener">${c.whatsapp_display}</a> o por mail a <a href="mailto:${c.email}">${c.email}</a>. Atendemos de ${c.hours.toLowerCase()}.</p>` },
  ];
}
