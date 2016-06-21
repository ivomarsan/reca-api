const mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , bcrypt = require('bcrypt')
  ;

module.exports = () => {

  // Schema do Model
  const _schema = new Schema(
    { user:
      { type: String
      , unique: true
      , required: true
      }
    , pass:
      { type: String
      , required: true
      }
    , isAdm:
      { type: Boolean
      , required: true
      , default: false
      }
    , createdAt: { type: Date, default: Date.now, index: true }
    , updatedAt: { type: Date, default: Date.now, index: true }
  });

  // Cria um índice no Schema
  _schema.index({ status: 1 });

  // Registra o horário da ultima alteração
  _schema.pre('update', () => this.update({}, { $set: { updated_at: new Date() } } ) );

  // A cada execução, se o password for alterado ele gera um salt e encripta com o salt gerado
  _schema.pre('save', function(next) {
    let _ = this;
    if (this.isModified('pass') || this.isNew) {
      bcrypt.genSalt(10, (err, salt) => {
        if(err) return next(err);
        bcrypt.hash(_.pass, salt, (err, hash) => {
          if(err) return next(err);
          _.pass = hash;
          next();
        });
      });
    } else
      return next();
  });

  // Valida a senha do usuário
  _schema.methods.validatePass = function(pass, cb) {
    bcrypt.compare(pass, this.pass, (err, isMatch) => cb(isMatch) );
  };

  // Exporta o Model
  return mongoose.model('User', _schema);
};
