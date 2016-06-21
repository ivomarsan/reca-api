const mongoose = require('mongoose');

module.exports = (uri) => {

  let db = mongoose.connection
    , options =
      { db: { native_parser: true }  //
      , server: { poolSize: 15 }    // Número de instâncias do servidor
      , user: null  // Usuário
      , pass: null  // Senha
      }
    ;

  // Conexão com o MongoDB
  mongoose.connect(uri,options);

	db.on('connected', () => {
	  console.log('Mongoose! Conectado em ' + uri);
	});

	db.on('disconnected', () => {
	  console.log('Mongoose! Desconectado de ' + uri);
	});

  // Erro na conexão
  db.on('error', (erro) => {
	  console.log('Mongoose! Erro na conexão:\n' + erro);
	});

  // Fechar o Mongoose caso o Processo do NodeJS seja finalizado
	process.on('SIGINT', () => {
	  db.close(() => {
      console.log('\n*\n*\tMongoose! Desconectado pelo término da aplicação\n*');
      process.exit(0);
    });
  });

  // Visualizar no terminal as operações realizadas pelo Mongoose
  //mongoose.set('debug', true);

};
