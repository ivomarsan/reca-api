const app = require('./config/express')()
    , mongo = require('./config/db.js')
    , port = app.get('port')
  ;

process.on('uncaughtException', err => console.log(err) );

const server = app.listen(port, () => {
  console.log('\n******************************************************');
  console.log('\tExpress Server escutando na porta', server.address().port);
  console.log('******************************************************\n');

  mongo('mongodb://localhost/reca');
});
