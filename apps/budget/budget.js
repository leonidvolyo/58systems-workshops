(function(){
  'use strict';
  const B=window.BudgetCore;
  const el=id=>document.getElementById(id),err=el('error'),out=el('result');
  const label={ok:'Всё в порядке',tight:'Впритык',deficit:'Дефицит: траты больше дохода'};
  function render(){
    err.hidden=true;
    try{
      const r=B.calculate({income:el('income').value,fixed:el('fixed').value,savingsPercent:el('pct').value,daysLeft:el('days').value});
      out.textContent='';
      const big=document.createElement('div');big.className='big';big.textContent=B.money(r.perDayCents)+' в день';
      const p1=document.createElement('p');p1.textContent='Свободно за месяц: '+B.money(r.freeCents)+'. Откладываем: '+B.money(r.savingsCents)+'.';
      const p2=document.createElement('p');p2.className=r.status==='ok'?'':'warn';p2.textContent=label[r.status];
      out.append(big,p1,p2);
    }catch(ex){out.textContent='';err.textContent=ex.message;err.hidden=false;}
  }
  ['income','fixed','pct','days'].forEach(i=>el(i).addEventListener('input',render));render();
})();
