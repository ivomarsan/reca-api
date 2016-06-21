module.exports = (app) => {
  const controller = app.controllers.user;

  app.route('/').get(controller.welcome);

  app.route('/auth')
     .post(controller.auth)
  ;
  app.route('/signin')
     .post(controller.signin)
  ;
};
