/* Track C reference logic: monthly "free money per day" planner. Pure logic, browser + Node compatible. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.BudgetCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const LIMITS={income:10000000,fixed:10000000,savingsPercent:100,daysLeft:31};
  const TIGHT_PER_DAY_CENTS=20000; // below 200 per day we say "tight" (demo threshold, not advice)
  function parseField(value,key){
    if(value==null||String(value).trim()==='')throw new Error(key+' is required.');
    const n=Number(value);
    if(!Number.isFinite(n))throw new Error(key+' must be a number.');
    if(n<0)throw new Error(key+' cannot be negative.');
    if(n>LIMITS[key])throw new Error(key+' exceeds the demo limit.');
    return n;
  }
  function calculate(input){
    const income=parseField(input.income,'income');
    const fixed=parseField(input.fixed,'fixed');
    const pct=parseField(input.savingsPercent,'savingsPercent');
    const days=parseField(input.daysLeft,'daysLeft');
    if(!Number.isInteger(days)||days<1)throw new Error('daysLeft must be a whole number from 1 to 31.');
    const incomeC=Math.round(income*100), fixedC=Math.round(fixed*100);
    const savingsC=Math.round(incomeC*pct/100);
    const freeC=incomeC-fixedC-savingsC;
    const perDayC=freeC>0?Math.floor(freeC/days):0;
    const status=freeC<0?'deficit':(perDayC<TIGHT_PER_DAY_CENTS?'tight':'ok');
    return {incomeCents:incomeC,fixedCents:fixedC,savingsCents:savingsC,freeCents:freeC,perDayCents:perDayC,status,
      notes:'Illustrative planner, not financial advice.'};
  }
  function money(cents){return new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(cents/100);}
  return {LIMITS,TIGHT_PER_DAY_CENTS,parseField,calculate,money};
});
