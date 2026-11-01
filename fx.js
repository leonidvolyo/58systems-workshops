/* Cinematic layer. Optional: if GSAP / ScrollTrigger / Lenis are missing or the visitor prefers reduced motion,
   this file does nothing and the page still works (site.js + CSS carry everything).
   Techniques after the public LUME guide (MIT): Lenis smooth scroll synced to GSAP, split-text reveals, magnetic buttons, loader. */
(function(){
  'use strict';
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const g=window.gsap,ST=window.ScrollTrigger,L=window.Lenis;
  const mark=function(){try{sessionStorage.setItem('fx-seen','1');}catch(e){}};
  const finish=function(){root.classList.add('reveal');root.classList.remove('loading');mark();};
  if(reduce||!g||!ST||!L){finish();return;}
  g.registerPlugin(ST);root.classList.add('fx');

  /* ---------- smooth scroll (Lenis) synced with ScrollTrigger ---------- */
  const lenis=new L({duration:1.15,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t));},smoothWheel:true});
  window.__lenis=lenis;
  lenis.on('scroll',ST.update);
  g.ticker.add(function(t){lenis.raf(t*1000);});g.ticker.lagSmoothing(0);
  document.addEventListener('click',function(e){
    const a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
    const id=a.getAttribute('href');
    if(id==='#'||id==='#top'){e.preventDefault();lenis.scrollTo(0,{duration:1.4});return;}
    const el=document.querySelector(id);if(!el)return;
    e.preventDefault();lenis.scrollTo(el,{offset:(id==='#story'||id==='#zoom')?0:-70,duration:1.5});
  });

  /* ---------- hero parallax (created after the intro so it never fights it) ---------- */
  let parallaxed=false;
  const parallax=function(){
    if(parallaxed)return;parallaxed=true;
    g.matchMedia().add('(min-width: 900px)',function(){
      g.to('#glHero',{yPercent:16,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
      g.to('.hero-in',{yPercent:-9,opacity:.15,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom 30%',scrub:true}});
    });
  };
  const intro=function(){parallax();};

  /* ---------- loader: counter, then the curtain lifts and the hero reveals ---------- */
  const loader=document.getElementById('loader'),lc=document.getElementById('lc');
  let seen=null;try{seen=sessionStorage.getItem('fx-seen');}catch(e){}
  if(root.classList.contains('loading')&&loader&&lc&&!seen){
    const o={v:0};lenis.stop();
    g.timeline({onComplete:function(){root.classList.remove('loading');mark();lenis.start();}})
      .to(o,{v:100,duration:1.25,ease:'power2.inOut',onUpdate:function(){lc.textContent=Math.round(o.v);}})
      .to(loader,{yPercent:-100,duration:.95,ease:'power4.inOut',onStart:function(){root.classList.add('reveal');intro();}});
  }else{finish();intro();}

  /* ---------- split-text reveals for section titles ---------- */
  const split=function(el){
    const txt=el.textContent.replace(/\s+/g,' ').trim();el.setAttribute('aria-label',txt);el.textContent='';
    const frag=document.createDocumentFragment(),words=txt.split(' ');
    words.forEach(function(w,i){
      const sw=document.createElement('span');sw.className='sw';sw.setAttribute('aria-hidden','true');
      Array.prototype.forEach.call(w,function(ch){const c=document.createElement('span');c.className='sc';c.textContent=ch;sw.appendChild(c);});
      frag.appendChild(sw);if(i<words.length-1)frag.appendChild(document.createTextNode(' '));
    });
    el.appendChild(frag);return el.querySelectorAll('.sc');
  };
  document.querySelectorAll('main h2').forEach(function(h){
    if(h.closest('.hero'))return;
    const chars=split(h);
    g.from(chars,{yPercent:118,duration:1.05,ease:'power4.out',stagger:{each:.016},scrollTrigger:{trigger:h,start:'top 90%',once:true}});
  });

  /* ---------- marquee speeds up with scroll velocity ---------- */
  const mq=document.querySelector('.mq'),mqa=mq&&mq.getAnimations?mq.getAnimations()[0]:null;
  if(mqa)lenis.on('scroll',function(e){mqa.updatePlaybackRate(1+Math.min(7,Math.abs(e.velocity)*.7));});

  /* ---------- desktop-only touches: magnetic buttons and card tilt ---------- */
  if(fine){
    document.querySelectorAll('.btn.primary,.btn.sm,.mcta').forEach(function(b){
      const xt=g.quickTo(b,'x',{duration:.5,ease:'power3'}),yt=g.quickTo(b,'y',{duration:.5,ease:'power3'});
      b.addEventListener('pointermove',function(e){const r=b.getBoundingClientRect();xt((e.clientX-r.left-r.width/2)*.25);yt((e.clientY-r.top-r.height/2)*.35);});
      b.addEventListener('pointerleave',function(){xt(0);yt(0);});
    });
    document.querySelectorAll('.gc,.lv,.fit-i,.rule').forEach(function(c){
      const rx=g.quickTo(c,'rotationX',{duration:.6,ease:'power3'}),ry=g.quickTo(c,'rotationY',{duration:.6,ease:'power3'});
      g.set(c,{transformPerspective:900});
      c.addEventListener('pointermove',function(e){const r=c.getBoundingClientRect();ry(((e.clientX-r.left)/r.width-.5)*7);rx(-((e.clientY-r.top)/r.height-.5)*7);});
      c.addEventListener('pointerleave',function(){rx(0);ry(0);});
    });
  }
  window.addEventListener('load',function(){ST.refresh();});
})();
