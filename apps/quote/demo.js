(function(){
  'use strict';
  const core=window.QuoteCore;
  const $=id=>document.getElementById(id);
  const keys=['hours','rate','extras','travel','discount'];
  const outputIds=['labor','additions','subtotal','discount-result','total'];
  function inputs(){const obj={};keys.forEach(k=>obj[k]=$(k).value);return obj;}
  function evaluate(){
    try{
      const r=core.calculate(inputs());
      const parts=[core.euro(r.laborCents),core.euro(r.additionsCents),core.euro(r.subtotalCents),'−'+core.euro(r.discountCents),core.euro(r.totalCents)];
      outputIds.forEach((id,i)=>$(id).textContent=parts[i]);
      $('error').hidden=true;
      $('copy').disabled=false;
      return r;
    } catch(e){
      outputIds.forEach(id=>$(id).textContent='—');
      $('error').textContent=e.message;$('error').hidden=false;
      $('copy').disabled=true;
      return null;
    }
  }
  function preset(name){
    const data=core.PRESETS[name];if(!data)return;
    keys.forEach(k=>$(k).value=data[k]);
    $('note').value='';$('feedback').textContent='';evaluate();
  }
  $('preset').addEventListener('change',e=>preset(e.target.value));
  keys.forEach(k=>$(k).addEventListener('input',()=>{$('feedback').textContent='';evaluate();}));
  $('reset').addEventListener('click',()=>preset($('preset').value));
  $('print').addEventListener('click',()=>window.print());
  $('copy').addEventListener('click',async()=>{
    const r=evaluate();if(!r)return;
    const note=$('note').value.trim();
    const message=`QuoteKit Lite · ${$('preset').value}\nHours: ${$('hours').value}\nRate: ${core.euro(Math.round(Number($('rate').value)*100))}/hour\nExtras + travel: ${core.euro(r.additionsCents)}\nDiscount: ${core.euro(r.discountCents)}\nTotal: ${core.euro(r.totalCents)}${note?'\nSample note: '+note:''}\nIllustrative estimate, not an invoice.`;
    try{await navigator.clipboard.writeText(message);$('feedback').textContent='Sample estimate copied.';}
    catch{$('feedback').textContent='Clipboard unavailable in this browser. Select the values from the preview instead.';}
  });
  evaluate();
})();
