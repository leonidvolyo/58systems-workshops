(function(){
  'use strict';
  const {CONFIG,score}=window.QuizCore;
  const form=document.getElementById('quiz'),err=document.getElementById('error'),out=document.getElementById('result');
  CONFIG.questions.forEach((q,qi)=>{
    const fs=document.createElement('fieldset'),lg=document.createElement('legend');
    lg.textContent=(qi+1)+'. '+q.text;fs.appendChild(lg);
    q.options.forEach((o,oi)=>{
      const l=document.createElement('label');l.className='opt';
      const r=document.createElement('input');r.type='radio';r.name=q.id;r.value=String(oi);
      l.append(r,document.createTextNode(o.label));fs.appendChild(l);
    });
    form.appendChild(fs);
  });
  const btn=document.createElement('button');btn.type='submit';btn.textContent='Показать результат';form.appendChild(btn);
  form.addEventListener('submit',e=>{
    e.preventDefault();err.hidden=true;out.hidden=true;
    const answers={};
    CONFIG.questions.forEach(q=>{const c=form.querySelector('input[name="'+q.id+'"]:checked');if(c)answers[q.id]=c.value;});
    try{
      const r=score(CONFIG,answers),p=CONFIG.packages.find(x=>x.id===r.winnerId);
      out.textContent='';
      const h=document.createElement('div');h.className='big';h.textContent=p.name;
      const t=document.createElement('p');t.textContent=p.text;
      out.append(h,t);
      if(r.tie){const w=document.createElement('p');w.className='warn';w.textContent='Два пакета подошли одинаково — показан более короткий.';out.appendChild(w);}
      out.hidden=false;
    }catch(ex){err.textContent=ex.message;err.hidden=false;}
  });
})();
