const nodemailer = require('nodemailer');
const Namesify = require('namesify');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const _f = require('./views/pedido/filter');

const log = {};
log.ok = (txt) => console.log('\033[1;32m'+ txt +'\u001b[0m')
log.err = (txt) => console.log('\033[1;31m'+ txt +'\u001b[0m')
log.blue = (txt) => console.log('\033[1;34m'+ txt +'\u001b[0m')

module.exports = (app) => {
  'use strict';

  const Pedido = app.models.pedido
      , User = app.models.user
      , controller = {}
    ;

  const sendEmail = (pedido, status) => {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport('smtps://reca.ifce%40gmail.com:lara2016@smtp.gmail.com');

    let nome = new Namesify(pedido.REQ_SOLICITANTE);
    let mailOptions = {};
    if(status)
      mailOptions =
      { from: '"🚘 Reserva de Veículos" <reca.ifce@gmail.com>' // sender address
      , to: pedido.REQ_EMAIL // list of receivers
      , subject: 'Solicitação Aprovada 😁' // Subject line
      , text: 'Sua reserva foi aprovada! Obrigado por usar o RECA :)' // plaintext body
      , html: '<p>Olá, '+nome.first()+'</p><p>Sua Solicitação foi Aprovada</p><br><br><b>Pedido ✔<br>Aprovação ✔<br>Viagem ...</b><br><br><i>RECA, porque Santo de casa também faz milagre</i>' // html body
      , attachments: [ // use URL as an attachment
        { filename: 'Requisição de Veículo Oficial.pdf'
        , path: 'reca.pdf'
        }]
      };
    else
      mailOptions =
      { from: '"🚘 Reserva de Veículos" <reca.ifce@gmail.com>' // sender address
      , to: pedido.REQ_EMAIL // list of receivers
      , subject: 'Solicitação Recusada 😱' // Subject line
      , text: 'Sua reserva foi recusada. Mas não fique triste :/ Obrigado por usar o RECA :)' // plaintext body
      , html: '<p>Olá, '+nome.first()+'</p><p>Sua Solicitação foi recusada</p><br><p><b>Motivo: </b>'+pedido.justificativa+'</p><br><i>RECA, porque Santo de casa também faz milagre</i>' // html body
      };

    const replace = (value, fil) => {
      let _v = _f.trim(value);
      if(fil == 'cpf')
        return _f.cpf(_v);
      else if(fil == 'cell')
        return _f.cell(_v);
      else if(fil == 'date')
        return _f.date(_v);
      else
        return '';
    };

    class Tokenizer {
      constructor(template) {
        this.data = template.split(/\{\{(.+?)\}\}/g);
      }
      replace() {
        let d = this.data.slice();
        for (let i=1, len=d.length; i<len; i+=2){
          let expr = d[i].trim()
            , args = expr.split('|')
            , value = args[0].trim()
          ;
          d[i] = pedido.hasOwnProperty( expr )
            ? pedido[ value ]
            : args.length > 1 && pedido.hasOwnProperty( value )
              ? replace(pedido[ value ], args[1].trim())
              : ''
          ;
        }
        return d.join('');
      }
    }

    let html = fs.readFileSync(__dirname+'/views/pedido/content.html', 'utf8');
    // o Replace das Imagens DEVE vir antes do replace dos tokens (a.k.a. AE)
    const image = path.join('file://', __dirname, './views/pedido/ifce.png');
    html = html.replace('{{ifce}}', image);

    let tel = pedido.REQ_TELEFONE;
    html = html.replace('{{tel}}', tel ? ' - '+replace(tel,'cell') : '' );

    let arr = [];
    let c=0;
    if(pedido.passageiros)
      pedido.passageiros.forEach((v,i) => arr[i]='<div><span class="nome">'+(++c)+' - '
                                        +v.NOME+'</span><span class="matricula">'
                                        +v.MATRICULA+'</span><span class="cpf">'
                                        +replace(v.CPF,'cpf')+'</span><span class="cell">'
                                        +replace(v.CELULAR, 'cell')+'</span></div>');
    let passageiros = '';
    arr.forEach(tr => passageiros+=tr);
    html = html.replace('{{passageiros}}', passageiros);

    const tk = new Tokenizer(html);
    html = tk.replace();

    //console.log(html);
    const options = {
      "format": "A4",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
      "orientation": "portrait", // portrait or landscape
      "border": {
        "top": ".5in",            // default is 0, units: mm, cm, in, px
        "right": ".5in",
        "bottom": ".81in",
        "left": ".5in"
      },
      // File options
      "type": "pdf",             // allowed file types: png, jpeg, pdf
      "quality": "75",           // only used for types png & jpeg
      "header": {
        "height": "8mm"
      },
      "footer": {
        "height": "10mm",
        "contents": '<br><br><p style="color: #444; text-align: right; float: right">Página {{page}} de {{pages}}</p>'+
                    'Reca © 2016 by LAR-A<br>'+
                    _f.date(new Date(), '_D, D de _M de AAAA às HH:II:SS')+'</span>'
      },
    };
    pdf.create(html, options).toBuffer( (err, buffer) => {
      if(err) return log.err(err);
      if(status)
        mailOptions.attachments = [{   // binary buffer as an attachment
          filename: 'Requisição de Veículo Oficial.pdf',
          content: buffer
        }];

      transporter.sendMail(mailOptions, (err, data) => {
        if(err) return log.err(err);
        log.blue('Message sent');
        console.log(' -> email:', pedido.REQ_EMAIL, '\n -> status:', data.response);
      });
    });
  };


  const getToken = (headers) => {
    if (!headers || !headers.authorization)
      return null;

    return headers.authorization;
  };
  controller.listPedidos = (req, res) => {
    Pedido.find().exec()
      .then
      ( (data) => {
          res.json(data);
        }
      , (err) => {
          log.err(err);
          res.status(500).json(err);
        }
      )
    ;
  };


  controller.getPedido = (req, res) => {
    let _id = req.params.id;

    Pedido.findById( _id ).exec()
      .then
      ( (data) => {
          if(!data) throw new Error('Pedido não encontrado');
          res.json(data);
        }
      , (err) => {
          log.err(err);
          res.status(404).json(err);
        }
      )
    ;
  };


  controller.setPedido = (req, res) => {
    const insert = (pedido) => {
      Pedido.create(pedido)
        .then
        ( (data) => {
            log.ok('API: SetPedido');
            console.log(' -> _id:', data._id);
            // console.log(data);
            res.status(201).json(data);
          }
        , (err) => {
            log.err(err);
            res.status(500).json(err);
          }
        )
      ;
    };
    const update = (pedido) => {
      let status = pedido.status === 1 ? 1 : 0;

      Pedido.findByIdAndUpdate( pedido._id, pedido ).exec()
        .then
        ( data => {
            sendEmail(pedido, status);
            log.ok('API: UpPedido');
            console.log(' -> _id:', pedido._id);
            //console.dir(pedido);
            res.status(200).json(data);
          }
        , err => {
            log.err(err);
            res.status(500).json(err);
          }
        )
      ;
    };


    let pedido = req.body;

    pedido = pedido._id
      ? update(pedido)
      : insert(pedido)
    ;
  };


  return controller;
};
