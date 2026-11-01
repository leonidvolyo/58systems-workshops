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
  function wrap(ctx,text,x,y,maxW,lh){
    const words=text.split(' ');let line='';
    words.forEach(function(w){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){ctx.fillText(line,x,y);line=w;y+=lh;}else line=t;});
    ctx.fillText(line,x,y);return y;
  }
  function downloadCard(p){
    const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d');
    const g=x.createLinearGradient(0,0,1080,1920);g.addColorStop(0,'#09090b');g.addColorStop(1,'#1a2108');x.fillStyle=g;x.fillRect(0,0,1080,1920);
    x.textAlign='center';x.fillStyle='#d7ff3f';x.font='700 44px "Inter Tight",system-ui,sans-serif';x.fillText('МОЙ РЕЗУЛЬТАТ',540,520);
    x.fillStyle='#ffffff';x.font='800 120px "Inter Tight",system-ui,sans-serif';wrap(x,p.name,540,760,900,140);
    x.fillStyle='#a1a1aa';x.font='48px "Inter Tight",system-ui,sans-serif';wrap(x,p.text,540,1020,860,66);
    x.fillStyle='#a1a1aa';x.font='40px "Inter Tight",system-ui,sans-serif';x.fillText('Сделано на воркшопе 58 Systems',540,1700);
    const a=document.createElement('a');a.download='moi-rezultat.png';a.href=c.toDataURL('image/png');a.click();
  }
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
      const dl=document.createElement('button');dl.type='button';dl.textContent='Скачать карточку для Stories';
      dl.addEventListener('click',function(){downloadCard(p);});out.appendChild(dl);
      out.hidden=false;
    }catch(ex){err.textContent=ex.message;err.hidden=false;}
  });
})();
