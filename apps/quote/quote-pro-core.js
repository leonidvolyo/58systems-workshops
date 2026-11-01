/* Track A reference logic: "smart quote" with 3 packages. Pure logic, browser + Node compatible. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.QuotePro=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const PACKAGES={basic:{name:'Базовый',mult:1},standard:{name:'Стандарт',mult:1.25},premium:{name:'Премиум',mult:1.6}};
  const LIMITS={hours:10000,rate:100000,extras:1000000,travel:1000000,discount:1000000};
  function parseField(value,key){
    if(value==null||String(value).trim()==='')throw new Error('Поле «'+key+'» обязательно.');
    const n=Number(value);
    if(!Number.isFinite(n))throw new Error('Поле «'+key+'» должно быть числом.');
    if(n<0)throw new Error('Поле «'+key+'» не может быть отрицательным.');
    if(n>LIMITS[key])throw new Error('Поле «'+key+'» превышает лимит примера.');
    return n;
  }
  function calculate(input){
    const pkg=PACKAGES[input.pkg];
    if(!pkg)throw new Error('Неизвестный пакет.');
    const n={};
    Object.keys(LIMITS).forEach(k=>{n[k]=parseField(input[k],k);});
    const labor=Math.round(n.hours*n.rate*pkg.mult*100);
    const additions=Math.round(n.extras*100)+Math.round(n.travel*100);
    const subtotal=labor+additions;
    const discount=Math.round(n.discount*100);
    if(discount>subtotal)throw new Error('Скидка не может быть больше суммы.');
    return {laborCents:labor,additionsCents:additions,subtotalCents:subtotal,discountCents:discount,totalCents:subtotal-discount,pkgName:pkg.name};
  }
  function euro(cents){return new Intl.NumberFormat('ru-RU',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(cents/100);}
  return {PACKAGES,LIMITS,parseField,calculate,euro};
});
