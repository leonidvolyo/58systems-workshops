(function(){
  'use strict';
  const c=window.PILOT_CONFIG||{};
  const $=function(s,r){return (r||document).querySelector(s);},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
  const root=document.documentElement;
  const reduce=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const fine=!!(window.matchMedia&&window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  const hasIO='IntersectionObserver' in window;
  const clamp=function(v,a,b){return Math.max(a,Math.min(b,v));};
  const animate=!reduce&&hasIO;
  root.classList.add(animate?'anim':'static');

  /* ================= sign-up (waitlist) ================= */
  const endpoint=(function(){try{const u=new URL(c.formEndpoint);return u.protocol==='https:'&&u.hostname==='script.google.com'?u.href:'';}catch(e){return '';}})();
  const open=c.enrollmentOpen===true&&endpoint!=='';
  const waitlist=open&&!c.dates;
  const form=$('#signup-form'),msg=$('#form-msg'),done=$('#done'),closed=$('#closedMsg'),send=$('#send'),preview=$('#preview');
  $$('[data-cta]').forEach(function(a){
    if(open){a.setAttribute('href','#signup');a.removeAttribute('aria-disabled');a.textContent=a.classList.contains('sm')?(waitlist?'Список ожидания':'Записаться'):(waitlist?'Встать в список ожидания':'Записаться на бесплатный пилот');}
    else if(!a.classList.contains('sm')){a.removeAttribute('href');a.setAttribute('aria-disabled','true');}
  });
  if(preview)preview.hidden=open;
  if(open&&form){
    form.hidden=false;if(closed)closed.hidden=true;
    if(c.dates)$('#dates').textContent=c.dates;
    form.addEventListener('submit',function(e){
      e.preventDefault();
      const d=new FormData(form);
      msg.className='msg';
      if(!d.get('name')||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.get('email')||''))||d.get('consent')!=='yes'){
        msg.textContent='Заполните имя, корректный e-mail и поставьте галочку согласия.';msg.className='msg err';return;
      }
      send.disabled=true;msg.textContent='Отправляю…';
      fetch(endpoint,{method:'POST',mode:'no-cors',body:new URLSearchParams(d)})
        .then(function(){form.hidden=true;done.hidden=false;done.scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'});})
        .catch(function(){send.disabled=false;msg.textContent='Не получилось отправить. Напишите мне напрямую'+(c.email?' на '+c.email:'')+'.';msg.className='msg err';});
    });
  }
  if(c.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)){
    const a=document.createElement('a');a.href='mailto:'+c.email;a.textContent=c.email;$('#contact').appendChild(a);
  }

  /* ================= FAQ accordion ================= */
  $$('#acc button').forEach(function(b){
    b.addEventListener('click',function(){b.setAttribute('aria-expanded',b.getAttribute('aria-expanded')==='true'?'false':'true');});
  });

  /* ================= project tabs ================= */
  const seg=$('#seg'),pill=$('#segPill'),tabs=$$('#seg [role=tab]'),panels=$$('.panel'),frames=$$('.pf');
  function loadFrame(i){const f=frames[i];if(f&&!f.getAttribute('src')&&f.dataset.src)f.src=f.dataset.src;}
  function placePill(){const t=tabs.filter(function(b){return b.getAttribute('aria-selected')==='true';})[0];if(t&&pill){pill.style.setProperty('--x',t.offsetLeft+'px');pill.style.setProperty('--w',t.offsetWidth+'px');}}
  function selectTab(i,focus){
    tabs.forEach(function(b,k){b.setAttribute('aria-selected',k===i?'true':'false');b.tabIndex=k===i?0:-1;});
    panels.forEach(function(p,k){p.hidden=k!==i;p.classList.toggle('on',k===i);});
    loadFrame(i);frames.forEach(function(f,k){f.classList.toggle('on',k===i);});
    placePill();if(focus)tabs[i].focus();
  }
  tabs.forEach(function(b,i){
    b.addEventListener('click',function(){selectTab(i);});
    b.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();selectTab((i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length,true);}
    });
  });
  if(seg){
    placePill();addEventListener('resize',placePill);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(placePill);
    if(hasIO){const fo=new IntersectionObserver(function(es){if(es[0].isIntersecting){loadFrame(0);fo.disconnect();}},{rootMargin:'600px'});fo.observe(seg);}else loadFrame(0);
  }

  /* ================= header ================= */
  const hdr=$('#hdr');

  /* ================= statement: words light up with scroll ================= */
  const stmt=$('#stmt');let words=[];
  if(stmt){
    const text=stmt.textContent.trim().split(/\s+/);stmt.textContent='';
    text.forEach(function(w,i){const s=document.createElement('span');s.className='w'+(i>=text.length-3?' acc':'');s.textContent=w+(i<text.length-1?' ':'');stmt.appendChild(s);words.push(s);});
    if(!animate)words.forEach(function(s){s.classList.add('lit');});
  }

  /* ================= phones ================= */
  const heroPh=$('#heroPhone'),pinPh=$('#pinPhone'),pscreen=$('#pscreen'),story=$('.story'),steps=$$('#steps li'),stepsEl=$('#steps');
  const typing=$('.typing'),full=typing?typing.textContent:'';
  let typeTimer=null,scene=-1;
  function typeText(){
    if(!typing)return;clearInterval(typeTimer);
    if(!animate){typing.textContent=full;return;}
    let i=0;typing.textContent='';
    typeTimer=setInterval(function(){i+=2;typing.textContent=full.slice(0,i);if(i>=full.length)clearInterval(typeTimer);},26);
  }
  function countUp(el){
    if(!el)return;const to=Number(el.dataset.to)||0;
    const cu=el.dataset.cur!=null?el.dataset.cur:' €';
    if(!animate){el.textContent=to+cu;return;}
    const t0=performance.now();(function tick(t){const k=Math.min(1,(t-t0)/900);el.textContent=Math.round(to*(1-Math.pow(1-k,3)))+cu;if(k<1)requestAnimationFrame(tick);})(t0);
  }
  function setScene(i){
    if(i===scene)return;scene=i;
    if(pscreen)pscreen.dataset.active=String(i);
    steps.forEach(function(s,k){s.classList.toggle('on',k===i);});
    if(i===0)typeText();
    if(i===1)countUp($('#s2-sum'));
  }
  if(!animate){typeText();countUp($('#s2-sum'));}

  /* pointer tilt for the hero phone / browser frame (desktop only), eased */
  const heroBf=$('#heroBf');
  let tx=0,ty=0,cx=0,cy=0,tiltRaf=0,heroBase=0;
  function tilt(){
    cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;
    if(heroPh){heroPh.style.setProperty('--ry',(-12+cx*16)+'deg');heroPh.style.setProperty('--rx',(-cy*10+heroBase)+'deg');}
    if(heroBf){heroBf.style.setProperty('--ry',(-9+cx*12)+'deg');heroBf.style.setProperty('--rx',(3-cy*7)+'deg');}
    if(Math.abs(tx-cx)>.002||Math.abs(ty-cy)>.002)tiltRaf=requestAnimationFrame(tilt);else tiltRaf=0;
  }
  if((heroPh||heroBf)&&animate&&fine){
    addEventListener('pointermove',function(e){tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5;if(!tiltRaf)tiltRaf=requestAnimationFrame(tilt);},{passive:true});
  }

  /* ================= live examples: load the right frame for the screen size ================= */
  const mqD=window.matchMedia('(min-width: 900px)');
  const loadIf=function(f){if(f&&!f.getAttribute('src')&&f.dataset.src)f.src=f.dataset.src;};
  const fit=function(){$$('.bf-view').forEach(function(v){v.style.setProperty('--k',(v.clientWidth/1280).toFixed(4));});};
  const wireHero=function(){loadIf(mqD.matches?$('#heroBf iframe'):$('#heroPhone iframe'));fit();};
  wireHero();if(mqD.addEventListener)mqD.addEventListener('change',wireHero);addEventListener('resize',fit);

  /* ================= showcase: browser frame zooms in, scrolls inside, zooms out (desktop only) ================= */
  const zoomEl=$('#zoom'),zPhone=$('#zPhone'),zBf=$('#zBf'),zFrame=$('#zFrame'),zFramePh=$('#zFramePh'),zcopy=$('#zcopy'),cobar=$('#cobar'),cos=$$('#cobar li');
  const zoomOn=function(){return animate&&fine&&innerWidth>=1000;};
  const ease=function(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;};
  const sg=function(p,a,b){return ease(clamp((p-a)/(b-a),0,1));};
  const lerp=function(a,b,k){return a+(b-a)*k;};
  let zMax=0,zA=[0,0];
  function measureFrame(){try{const doc=zFrame.contentDocument,d=doc.documentElement;zMax=Math.max(0,d.scrollHeight-d.clientHeight);const sv=doc.getElementById('services'),ca=doc.getElementById('calc');zA=[sv?sv.offsetTop-120:zMax*.3,ca?ca.offsetTop-260:zMax*.7];}catch(e){zMax=0;}}
  function applyZoomMode(){
    if(!zoomEl)return;const on=zoomOn();zoomEl.classList.toggle('zoom-lite',!on);
    if(!on){zPhone.style.transform='';zcopy.style.opacity='';zcopy.style.transform='';}
    loadIf(on?zFrame:zFramePh);fit();
  }
  if(zFrame)zFrame.addEventListener('load',function(){measureFrame();onScroll();});
  if(hasIO&&zoomEl)new IntersectionObserver(function(es){if(es[0].isIntersecting)applyZoomMode();},{rootMargin:'900px'}).observe(zoomEl);
  applyZoomMode();
  addEventListener('resize',function(){applyZoomMode();measureFrame();});

  /* ================= one scroll handler, rAF-throttled ================= */
  let ticking=false;
  function update(){
    ticking=false;
    const vh=innerHeight,sy=scrollY;
    if(hdr)hdr.classList.toggle('scrolled',sy>24);
    if(animate){
      if(heroPh){heroBase=clamp(sy/vh,0,1)*14;if(!tiltRaf){heroPh.style.setProperty('--rx',(-cy*10+heroBase)+'deg');}}
      if(stmt){
        const r=stmt.getBoundingClientRect();
        const p=clamp((vh*.82-r.top)/(r.height+vh*.28),0,1),n=Math.round(p*words.length);
        for(let i=0;i<words.length;i++)words[i].classList.toggle('lit',i<n);
      }
      if(zoomEl&&zoomOn()){
        const zr=zoomEl.getBoundingClientRect();
        if(zr.bottom>-120&&zr.top<vh+120){
          const p=clamp(-zr.top/(zr.height-vh),0,1);
          const enter=sg(p,0,.14),zin=sg(p,.14,.30),zout=sg(p,.9,1);
          const s=lerp(lerp(lerp(.5,.7,enter),1,zin),.58,zout);
          const ry=lerp(lerp(lerp(-42,-8,enter),0,zin),24,zout);
          const rx=lerp(lerp(lerp(10,3,enter),0,zin),-4,zout);
          const rz=lerp(lerp(6,0,enter),-4,zout);
          const ty=lerp(lerp(vh*.27,0,enter),-vh*.04,zout),tx=lerp(0,innerWidth*.1,zout);
          zPhone.style.transform='translate3d('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px,0) rotate('+rz.toFixed(2)+'deg) scale('+s.toFixed(4)+')';
          zBf.style.setProperty('--ry',ry.toFixed(2)+'deg');zBf.style.setProperty('--rx',rx.toFixed(2)+'deg');
          const fade=sg(p,.02,.12);zcopy.style.opacity=String(1-fade);zcopy.style.transform='translateX('+(-fade*40).toFixed(1)+'px)';
          cobar.classList.toggle('on',p>.28&&p<.97);
          if(!zMax)measureFrame();
          if(zMax){const yy=Math.round(sg(p,.26,.9)*zMax);try{zFrame.contentWindow.scrollTo({top:yy,behavior:'instant'});}catch(e){}const idx=yy<zA[0]?0:(yy<zA[1]?1:2);cos.forEach(function(c,k){c.classList.toggle('on',p>.28&&p<.97&&k===idx);});}
        }
      }
      if(story&&pinPh){
        const r=story.getBoundingClientRect(),total=r.height-vh,p=clamp(-r.top/total,0,1);
        const amp=innerWidth<860?22:30;
        pinPh.style.setProperty('--ry',(-amp+2*amp*p)+'deg');
        pinPh.style.setProperty('--rx',(8*Math.sin(p*Math.PI*3))+'deg');
        if(stepsEl)stepsEl.style.setProperty('--p',String(p));
        setScene(Math.min(3,Math.floor(p*4)));
      }
    }
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(update);}}
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
  if(animate)setScene(0);
  update();

  /* ================= pause endless animations when off-screen ================= */
  if(animate){
    const po=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('paused',!e.isIntersecting);});});
    $$('.marquee,.hero').forEach(function(el){po.observe(el);});
  }

  /* ================= reveal on scroll ================= */
  if(animate){
    const ro=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target);}});},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
    $$('.rv').forEach(function(el){ro.observe(el);});
  }

  /* ================= mobile menu (no libraries needed) ================= */
  const burger=$('#burger'),menu=$('#menu');
  function setMenu(open){
    if(!burger||!menu)return;
    if(open)menu.hidden=false;
    requestAnimationFrame(function(){menu.classList.toggle('open',open);});
    burger.setAttribute('aria-expanded',open?'true':'false');
    if(window.__lenis){open?window.__lenis.stop():window.__lenis.start();}else document.documentElement.style.overflow=open?'hidden':'';
    if(!open)setTimeout(function(){if(!menu.classList.contains('open'))menu.hidden=true;},500);
  }
  if(burger&&menu){
    burger.addEventListener('click',function(){setMenu(!menu.classList.contains('open'));});
    menu.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false);});
    addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.classList.contains('open'))setMenu(false);});
    addEventListener('resize',function(){if(innerWidth>1000&&menu.classList.contains('open'))setMenu(false);});
  }
})();
