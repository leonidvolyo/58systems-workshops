/* Cinematic extras without any library: WebGL "liquid light" shader (hero + finale), prompt typewriter,
   cursor ring, scroll progress. Everything is optional: if WebGL fails or the device is slow the CSS gradient stays. */
(function(){
  'use strict';
  var root=document.documentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
  var small=Math.min(innerWidth,innerHeight)<700;

  /* ---------------- shader ---------------- */
  var VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FS=[
    '#ifdef GL_FRAGMENT_PRECISION_HIGH','precision highp float;','#else','precision mediump float;','#endif',
    'uniform vec2 uR;uniform float uT;uniform vec2 uM;uniform float uK;uniform float uS;uniform float uSeed;',
    'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}',
    'void main(){',
    ' vec2 frag=gl_FragCoord.xy;float sc=min(uR.x,uR.y);',
    ' vec2 p=(frag-.5*uR)/sc;vec2 m=(uM*uR-.5*uR)/sc;',
    ' vec2 d=p-m;float r=length(d);',
    ' p+=normalize(d+vec2(1e-4))*exp(-r*r*7.)*(.10+.24*uK);',
    ' float t=uT*.05+uSeed;p.y+=uS*.35;',
    ' vec2 q=vec2(fbm(p*1.5+vec2(0.,t)),fbm(p*1.5+vec2(5.2,1.3)-t));',
    ' vec2 w=vec2(fbm(p*1.5+3.*q+vec2(1.7,9.2)+t*1.4),fbm(p*1.5+3.*q+vec2(8.3,2.8)-t*1.1));',
    ' float f=fbm(p*1.3+3.4*w);',
    ' vec3 col=vec3(.035,.035,.043);',
    ' col=mix(col,vec3(.03,.34,.27),smoothstep(.22,.66,f));',
    ' col=mix(col,vec3(.34,.12,.70),smoothstep(.38,.92,w.x)*.9*(1.-smoothstep(.62,.9,f)*.4));',
    ' vec3 lime=vec3(.84,1.,.25);',
    ' float ridge=clamp(1.-abs(f*2.-1.15)*3.2,0.,1.);',
    ' col+=lime*pow(ridge,2.2)*(.85+.5*uK);',
    ' col+=lime*smoothstep(.8,1.,f)*.3;',
    ' col+=lime*exp(-r*r*10.)*(.14+.34*uK);',
    ' vec2 uv=frag/uR;col*=mix(.5,1.,smoothstep(0.,.62,1.-distance(uv,vec2(.5))));',
    ' col+=(hash(frag+uT*60.)-.5)*.035;',
    ' gl_FragColor=vec4(col,1.);}'
  ].join('\n');

  function sh(gl,type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;}

  function mount(canvas,opt){
    opt=opt||{};
    var host=canvas.parentElement;
    var fail=function(){canvas.classList.add('off');host.classList.add('gl-off');};
    var gl;try{gl=canvas.getContext('webgl',{antialias:false,alpha:false,depth:false,stencil:false,powerPreference:'low-power'});}catch(e){}
    if(!gl){fail();return null;}
    var vs=sh(gl,gl.VERTEX_SHADER,VS),fs=sh(gl,gl.FRAGMENT_SHADER,FS),pr=gl.createProgram();
    if(!vs||!fs){fail();return null;}
    gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){fail();return null;}
    gl.useProgram(pr);
    var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    var loc=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    var U={};['uR','uT','uM','uK','uS','uSeed'].forEach(function(n){U[n]=gl.getUniformLocation(pr,n);});

    var q=opt.q||(small?.5:.65);           /* render scale (CSS px -> canvas px), lowered automatically if slow */
    var st={vis:true,run:false,raf:0,t0:performance.now(),mx:.7,my:.55,tx:.7,ty:.55,act:0,lastMove:0,k:0,lx:0,ly:0,frames:0,acc:0,last:0,scroll:0,w:0,h:0};

    function size(){
      var w=Math.max(2,Math.round(host.clientWidth*q)),h=Math.max(2,Math.round(host.clientHeight*q));
      if(w!==st.w||h!==st.h){st.w=w;st.h=h;canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
    }
    function draw(now){
      var t=(now-st.t0)/1000;
      /* idle: the light drifts on its own; pointer takes over, then eases back */
      var idle=now-st.lastMove>2500;st.act+=((idle?0:1)-st.act)*.05;
      var ax=.72+.12*Math.sin(t*.31),ay=.55+.12*Math.cos(t*.23);
      st.mx+=((st.act>.02?st.tx:ax)-st.mx)*.08;st.my+=((st.act>.02?st.ty:ay)-st.my)*.08;
      st.k*=.94;
      gl.uniform2f(U.uR,st.w,st.h);gl.uniform1f(U.uT,opt.still?8:t);gl.uniform2f(U.uM,st.mx,st.my);
      gl.uniform1f(U.uK,Math.min(1,st.k));gl.uniform1f(U.uS,st.scroll);gl.uniform1f(U.uSeed,opt.seed||0);
      gl.drawArrays(gl.TRIANGLES,0,3);
    }
    function frame(now){
      st.raf=0;if(!st.run)return;
      /* adaptive quality: average frame time over ~40 frames; step the resolution down, give up (CSS fallback) if still slow */
      if(st.last){var dt=now-st.last;if(dt<250){st.acc+=dt;st.frames++;}
        if(st.frames>=40){var avg=st.acc/st.frames;st.frames=0;st.acc=0;
          if(avg>30){if(q>.36){q=Math.max(.34,q*.78);size();}else{stop();fail();return;}}}}
      st.last=now;size();draw(now);
      if(!canvas.classList.contains('on'))canvas.classList.add('on');
      st.raf=requestAnimationFrame(frame);
    }
    function start(){if(st.run||opt.still)return;st.run=true;st.last=0;st.raf=requestAnimationFrame(frame);}
    function stop(){st.run=false;if(st.raf)cancelAnimationFrame(st.raf);st.raf=0;}
    function check(){if(st.vis&&!document.hidden)start();else stop();}

    canvas.addEventListener('webglcontextlost',function(e){e.preventDefault();stop();fail();});
    if('IntersectionObserver' in window){new IntersectionObserver(function(es){st.vis=es[0].isIntersecting;check();},{rootMargin:'80px'}).observe(host);}
    document.addEventListener('visibilitychange',check);
    addEventListener('resize',function(){size();if(!st.run)draw(performance.now());},{passive:true});

    if(!opt.still){
      addEventListener('pointermove',function(e){
        var r=host.getBoundingClientRect();if(e.clientY<r.top-40||e.clientY>r.bottom+40)return;
        st.tx=(e.clientX-r.left)/r.width;st.ty=1-(e.clientY-r.top)/r.height;
        var dx=e.clientX-st.lx,dy=e.clientY-st.ly;st.lx=e.clientX;st.ly=e.clientY;
        st.k=Math.min(1,st.k+Math.hypot(dx,dy)/260);st.lastMove=performance.now();
      },{passive:true});
      addEventListener('scroll',function(){st.scroll=Math.min(3,scrollY/Math.max(1,innerHeight));},{passive:true});
    }
    size();draw(performance.now());canvas.classList.add('on');
    if(!opt.still)check();
    return {stop:stop,start:start,state:st,get q(){return q;}};
  }

  window.__gl={};
  var hero=document.getElementById('glHero'),fin=document.getElementById('glFin');
  if(hero)window.__gl.hero=mount(hero,{still:reduce,seed:4.2});
  if(fin)window.__gl.fin=mount(fin,{still:reduce,seed:7.3,q:small?.45:.55});

  /* ---------------- prompt typewriter (the idea of the whole workshop: words become a site) ---------------- */
  var pt=document.getElementById('ptype');
  if(pt&&!reduce){
    var lines=[
      'Сделай сайт-визитку фотографа: услуги, цены и запись в WhatsApp',
      'Сайт стилиста: капсульный гардероб, консультации и квиз «с чего начать»',
      'Страница репетитора: пробное занятие, расчёт цены и мини-группы',
      'Сайт мастера маникюра: прайс, галерея работ и онлайн-запись'
    ];
    var li=0,ci=0,dir=1,heroEl=document.getElementById('hero'),seen=true;
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){seen=es[0].isIntersecting;}).observe(heroEl);
    pt.textContent='';
    var step=function(){
      if(!seen||document.hidden||root.classList.contains('loading')){setTimeout(step,400);return;}
      var full=lines[li];
      if(dir>0){ci++;pt.textContent=full.slice(0,ci);if(ci>=full.length){dir=-1;setTimeout(step,2600);return;}setTimeout(step,28+Math.random()*34);}
      else{ci-=2;if(ci<=0){ci=0;pt.textContent='';dir=1;li=(li+1)%lines.length;setTimeout(step,350);return;}pt.textContent=full.slice(0,ci);setTimeout(step,12);}
    };
    setTimeout(step,1800);
  }

  /* ---------------- cursor ring (desktop pointer only; the system cursor stays) ---------------- */
  if(fine&&!reduce){
    var cur=document.createElement('div');cur.className='cur';cur.setAttribute('aria-hidden','true');document.body.appendChild(cur);
    var cx=0,cy=0,tx=0,ty=0,on=false,raf=0;
    var loop=function(){cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;cur.style.transform='translate3d('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px,0)';
      raf=(Math.abs(tx-cx)>.1||Math.abs(ty-cy)>.1)?requestAnimationFrame(loop):0;};
    addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;if(!on){on=true;cx=tx;cy=ty;cur.classList.add('on');}if(!raf)raf=requestAnimationFrame(loop);},{passive:true});
    document.addEventListener('pointerover',function(e){var t=e.target.closest&&e.target.closest('a,button,summary,label,.seg,select,input,.acc-i');cur.classList.toggle('big',!!t);});
    document.addEventListener('pointerleave',function(){cur.classList.remove('on');on=false;});
  }

  /* ---------------- scroll progress ---------------- */
  var bar=document.createElement('i');bar.className='prog';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
  var pr=0,upd=function(){pr=0;var h=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0).toFixed(4)+')';};
  addEventListener('scroll',function(){if(!pr)pr=requestAnimationFrame(upd);},{passive:true});upd();
})();
