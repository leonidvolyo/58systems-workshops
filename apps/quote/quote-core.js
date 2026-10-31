/* The course's reference calculator. Pure logic, browser + Node compatible. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.QuoteCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const PRESETS={
    Photographer:{hours:2,rate:60,extras:20,travel:0,discount:0},
    Tutor:{hours:3,rate:35,extras:0,travel:0,discount:0},
    Cleaner:{hours:4,rate:25,extras:15,travel:10,discount:5}
  };
  const LIMITS={hours:10000,rate:100000,extras:1000000,travel:1000000,discount:1000000};
  function parseField(value,key){
    if(value==null || String(value).trim()==='')throw new Error(key+' is required.');
    const n=Number(value);
    if(!Number.isFinite(n))throw new Error(key+' must be a number.');
    if(n<0)throw new Error(key+' cannot be negative.');
    if(n>LIMITS[key])throw new Error(key+' exceeds the demo limit.');
    return n;
  }
  function calculate(input){
    const n={};
    Object.keys(LIMITS).forEach(key=>{n[key]=parseField(input[key],key);});
    const labor=Math.round(n.hours*n.rate*100);
    const additions=Math.round(n.extras*100)+Math.round(n.travel*100);
    const subtotal=labor+additions;
    const discount=Math.round(n.discount*100);
    if(discount>subtotal)throw new Error('Discount cannot exceed the subtotal.');
    const total=subtotal-discount;
    return {laborCents:labor,additionsCents:additions,subtotalCents:subtotal,discountCents:discount,totalCents:total,notes:'Illustrative estimate, not an invoice.'};
  }
  function euro(cents){return new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR'}).format(cents/100);}
  return {PRESETS,LIMITS,parseField,calculate,euro};
});
