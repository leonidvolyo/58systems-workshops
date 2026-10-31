(function(){
  'use strict';
  const c=window.PILOT_CONFIG||{};
  const endpoint=(function(){try{const u=new URL(c.formEndpoint);return u.protocol==='https:'&&u.hostname==='script.google.com'?u.href:'';}catch(e){return '';}})();
  const open=c.enrollmentOpen===true&&endpoint!=='';
  ['cta','cta2'].forEach(id=>{
    const a=document.getElementById(id);if(!a)return;
    if(open){a.href='#signup';a.classList.remove('disabled');a.removeAttribute('aria-disabled');a.textContent='Записаться на бесплатный пилот →';}
    else{a.removeAttribute('href');a.classList.add('disabled');a.setAttribute('aria-disabled','true');a.textContent='Запись скоро откроется';}
  });
  const form=document.getElementById('signup-form'),msg=document.getElementById('form-msg');
  if(open&&form){
    form.hidden=false;
    document.getElementById('preview').hidden=true;
    if(c.dates)document.getElementById('dates').textContent=c.dates;
    form.addEventListener('submit',function(e){
      e.preventDefault();
      const d=new FormData(form);
      if(!d.get('name')||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.get('email')||''))||d.get('consent')!=='yes'){
        msg.textContent='Заполните имя, корректный e-mail и поставьте галочку согласия.';return;
      }
      msg.textContent='Отправляю…';
      fetch(endpoint,{method:'POST',mode:'no-cors',body:new URLSearchParams(d)})
        .then(function(){form.reset();msg.textContent='Спасибо! Заявка отправлена. Я напишу на указанный e-mail.';})
        .catch(function(){msg.textContent='Не получилось отправить. Напишите мне напрямую'+(c.email?' на '+c.email:'')+'.';});
    });
  }
  if(c.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)){
    const a=document.createElement('a');a.href='mailto:'+c.email;a.textContent=c.email;document.getElementById('contact').appendChild(a);
  }
})();
