(function(){
  'use strict';
  const Q=window.QuotePro,el=id=>document.getElementById(id);
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let shown=0,raf=0,last=null;
  function animateTotal(to){
    cancelAnimationFrame(raf);
    if(reduce){shown=to;el('total').textContent=Q.euro(to);return;}
    const from=shown,t0=performance.now();
    (function tick(t){const k=Math.min(1,(t-t0)/450);shown=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));el('total').textContent=Q.euro(shown);if(k<1)raf=requestAnimationFrame(tick);})(t0);
  }
  function read(){
    return {pkg:document.querySelector('input[name=pkg]:checked').value,hours:el('hours').value,rate:el('rate').value,extras:el('extras').value,travel:el('travel').value,discount:el('discount').value};
  }
  function render(){
    el('error').hidden=true;el('msg').textContent='';
    try{
      const r=Q.calculate(read());last=r;
      el('labor').textContent=Q.euro(r.laborCents);el('adds').textContent=Q.euro(r.additionsCents);
      el('disc').textContent='−'+Q.euro(r.discountCents);el('pkgname').textContent=r.pkgName;animateTotal(r.totalCents);
    }catch(ex){last=null;el('error').textContent=ex.message;el('error').hidden=false;}
  }
  document.getElementById('f').addEventListener('input',render);
  el('print').addEventListener('click',function(){window.print();});
  el('copy').addEventListener('click',function(){
    if(!last){el('msg').textContent='Сначала исправьте ошибку в полях.';return;}
    const text='Расчёт ('+last.pkgName+'): работа '+Q.euro(last.laborCents)+', расходы и выезд '+Q.euro(last.additionsCents)+', скидка −'+Q.euro(last.discountCents)+'. Итого: '+Q.euro(last.totalCents)+'. Ориентировочный расчёт, не счёт.';
    (navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject()).then(function(){el('msg').textContent='Скопировано.';},function(){el('msg').textContent='Не удалось скопировать — выделите текст вручную.';});
  });
  render();
})();
