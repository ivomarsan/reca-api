//module.exports = () => {
  'use strict';

  const uno = (n,i) => (n.toString()).slice(i,i+1);
  const qtd = value => (value.toString()).length;


  const filter = {};
  filter.cell = (value) => {
    let total = qtd(value)
      , format = total>10 ? '(xx) x xxxx-xxxx' : '(xx) xxxx-xxxx'
    ;
    for(let i=0; i<total; i++)
      format = format.replace('x', uno(value, i));
    return format;
  };
  filter.cpf = (value) => {
    let total = qtd(value)
      , format = total===11 ? 'xxx.xxx.xxx-xx' : ''
    ;
    for(let i=0; i<total; i++)
      format = format.replace('x', uno(value, i));
    return format;
  };
  filter.date = (value, _format) => {
    let day = 'Domingo_Segunda_Terça_Quarta_Quinta_Sexta_Sábado'.split('_')
      , month = 'Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_')
      , format = _format ? _format : '#, DD/MM/AAAA às HH:II'
      , YYYY,YY,MMMM,MMM,MM,DDDD,DDD,DD,m,d,h,i,s
      , now = new Date(value)
    ;
    format = format.replace('MM', (m=now.getMonth()+1) <10 ? ('0'+m) : m );
    format = format.replace('DD', (d=now.getDate())    <10 ? ('0'+d) : d );
    format = format.replace('HH', (h=now.getHours())   <10 ? ('0'+h) : h );
    format = format.replace('II', (i=now.getMinutes()) <10 ? ('0'+i) : i );
    format = format.replace('SS', (s=now.getSeconds()) <10 ? ('0'+s) : s );
    if (i===0) i=24;
    YY = ((YYYY=now.getFullYear())+'').slice(-2);
    MMM = (MMMM=month[m-1]).substr(0,3);
    DDD = (DDDD=day[now.getDay()]).substr(0,3);
    format = format.replace('AAAA',YYYY).replace('AA',YY).replace('_M',MMMM).replace('MMM',MMM).replace('_D',DDDD).replace('#',DDD).replace('D',d);
    return [format, h<12 ? ' AM' : ''].join('');
    //return format;
  };
  filter.trim = (str) => (str.toString()).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

/*
  return filter;
};
*/
module.exports = filter;


  /*

  ''.trim || (String.prototype.trim =
    function(){
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }
  );

  //new Filter(['10771849476', 'cpf'])
  const uno = (n,i) => (n.toString()).slice(i,i+1);
  const qtd = value => (value.toString()).length;


  class Filter {
    constructor(value) {
      if(!value) return '';
      this.value = (value.toString()).trim();
    }
    cell() {
      let total = qtd(this.value)
        , format = total>10 ? '(xx) x xxxx-xxxx' : '(xx) xxxx-xxxx'
      ;
      for(let i=0; i<total; i++)
        format = format.replace('x', uno(this.value, i));
      return format;
    }
    cpf() {
      let total = qtd(this.value)
        , format = total===11 ? 'xxx.xxx.xxx-xx' : ''
      ;
      for(let i=0; i<total; i++)
        format = format.replace('x', uno(this.value, i));
      return format;
    }
    date() {
      let day = 'Dom_Seg_Ter_Qua_Qui_Sex_Sáb'.split('_')
        , format = '#, DD/MM/AAAA às HH:II'
        , YYYY,MM,DDD,DD,m,d,h,i
        , now = new Date(+this.value)
      ;
      format = format.replace('MM', (m=now.getMonth()+1) <10 ? ('0'+m) : m );
      format = format.replace('DD', (d=now.getDate())    <10 ? ('0'+d) : d );
      format = format.replace('HH', (h=now.getHours())   <10 ? ('0'+h) : h );
      format = format.replace('II', (i=now.getMinutes()) <10 ? ('0'+i) : i );
      DDD = day[now.getDay()];
      YYYY= now.getFullYear();
      format = format.replace('AAAA',YYYY).replace('#',DDD);
      return format;
    }
  }

  */
