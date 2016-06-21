const mongoose = require('mongoose');

module.exports = () => {

  const passageiros = mongoose.Schema(
    { NOME:
      { type: String
      , required: true
      }
    , MATRICULA:
      { type: Number
      , required: true
      }
    , CPF:
      { type: String
      , required: true
      }
    , CELULAR:
      { type: Number
      , required: true
      }
  });

  const schema = mongoose.Schema(
    { REQ_SOLICITANTE:
      { type: String
      , trim: true
      , required: true
      }
    , REQ_MATRICULA:
      { type: Number
      , required: true
      , min: 0
      }
    , REQ_EMAIL:
      { type: String
      , required: true
      , lowercase: true
      }
    , REQ_CELULAR:
      { type: Number
      , required: true
      , min: 10
      }
    , REQ_SETOR:
      { type: String
      , required: true
      }
    , REQ_TELEFONE:
      { type: Number
      , min: 10
      }
    , REQ_CONTATO:
      { type: String
      , required: true
      }
    , REQ_CONTATO_CEL:
      { type: Number
      , required: true
      , min: 10
      }
    , REQ_DESTINO:
      { type: String
      , required: true
      }
    , REQ_PASSAGEIROS:
      { type: Number
      , required: true
      , min: 0
      , max: 45
      }
    , REQ_MOTIVO:
      { type: String
      , required: true
      }
    , REQ_ROTEIRO:
      { type: String
      , required: true
      }
    , REQ_DATA_SAIDA:
      { type: Date
      , required: true
      }
    , REQ_LOCAL_SAIDA:
      { type: String
      , required: true
      }
    , REQ_DATA_RETORNO:
      { type: Date
      , required: true
      }
    , REQ_LOCAL_RETORNO:
      { type: String
      , required: true
      }
    , passageiros:
      { type: [passageiros]
      , required: true
      }

    , created_at: { type: Date, default: Date.now, index: true }
    , status: { type: Number, default: 0 }
    , justificativa: String
  });
  schema.index({ status: 1 })


  return mongoose.model('Pedido', schema);
};
