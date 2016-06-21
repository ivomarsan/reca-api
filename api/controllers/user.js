const jwt = require('jwt-simple')
    , moment = require('moment')
    , SECRET = 'B@$k3t0'
  ;

module.exports = (app) => {

  const User = app.models.user
      , controller = {}
    ;


  /*
  \ *   MENSAGEM DE BOAS VINDAS
  */
  controller.welcome = (req, res) => res.json({ message: 'Welcome to the coolest API on earth!' });


  /*
  \ *   REGISTRO DE NOVO USUÁRIO
  */
  controller.signin = (req, res) => {
    if(!req.body.user || !req.body.pass)
      res.status(401).json({ success: false, message: 'Falha na Autenticação' });
    else {
      let newUser = new User({
        user: req.body.user,
        pass: req.body.pass
      });

      //Salvando o usuário
      newUser.save((err, user) => {
        if(err)
          res.status(400).json({ success: false, message: err.message });
        else
          res.status(200).json({ success: true, message: `O usuário: ${user.user} foi criado corretamente :)` });
      });
    }
  };


  /*
  \ *   AUTENTICAÇÃO
  */
  controller.auth = (req, res) => {
    // Se não for passado o user ou pass, retornará erro
    if(!req.body.user || !req.body.pass)
      return res.status(401).json({ success: false, message: 'Usuário ou Senha não informados' });
    // Busca pelo usuário informado
    User.findOne({ user: req.body.user }, (err, user) => {
      // Se der erro, já retorna o status de falha
      if(err || !user)
        return res.status(401).json({ success: false, message: 'Dados Inexistentes' });
      // Checa se a senha passada na requisição é compatível com a armazenada
      user.validatePass(req.body.pass, (isMatch) => {
        // Se não forem compativos, retorna status 401
        if(!isMatch)
          return res.status(401).json({ success: false, message: 'Falha na Autenticação' });
        // Adiciona um prazo de 7 dias posteriores para expirar
        let expires = moment().add(7,'days').valueOf();
        // Gera o token com a nossa data de expiração
        let token = jwt.encode({ iss: user._id, exp: expires}, SECRET);

        // Retorna nosso Token com outros dados
        return res.status(201).json(
          { success: true
          , message: `Olá ${user.user}, aproveite o seu token!`
          , token : token
          , expires: expires
        });
      });
    });
  };


  /*
  \ *   JWT - MIDDLEWARE
  */
  controller.jwt = (req, res, next) => {
    const getToken = (req) => {
      if (req.body && req.body.access_token)
        return req.body.access_token
      if (req.query && req.query.access_token)
        return req.query.access_token
      if (req.headers && req.headers['x-access-token'])
        req.headers['x-access-token']
      if (req.headers && req.headers.authorization)
        return req.headers.authorization
    };

    // Captura o Token do Header da Requisição
    let token = getToken(req);
    if(token) {
      try {
        let decoded = jwt.decode(token, SECRET);
        if (decoded.exp <= Date.now())
          return res.status(401).json({ success: false, message: 'O Token Expirou' });
        User.findOne({ _id: decoded.iss }, (err, user) => {
          if(err)
            return res.status(500).json({ success: false, message: 'O Token não corresponde ao Usuário' });
          // req.user = user;
          return next();
        });
      } catch(err) {
        return res.status(401).json({ success: false, message: 'Token Inválido' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'Token Inexistente' });
    }
  };

  return controller;
};
