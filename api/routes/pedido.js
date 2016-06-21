module.exports = (app) => {
  const controller = app.controllers.pedido
      , jwt = app.controllers.user.jwt
    ;

  app.route('/pedido')
     .get(jwt, controller.listPedidos)
     .post(controller.setPedido)
  ;
  app.route('/pedido/:id')
     .get(jwt, controller.getPedido)
  ;
};
