/* Track B reference logic: "Which package suits you?" quiz. Pure logic, browser + Node compatible. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.QuizCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // Fictional example: a photographer helping a client choose a session type.
  const CONFIG={
    packages:[
      {id:'mini',name:'Mini session',text:'30 minutes, 10 edited photos. Good for a quick portrait.'},
      {id:'standard',name:'Standard session',text:'1.5 hours, 30 edited photos. Good for most people.'},
      {id:'full',name:'Full day',text:'4 hours, 80 edited photos and 2 locations. Good for events and families.'}
    ],
    questions:[
      {id:'purpose',text:'What is the photo for?',options:[
        {label:'A profile picture',points:{mini:2}},
        {label:'Social media and a website',points:{standard:2}},
        {label:'A family event or a wedding',points:{full:2}}]},
      {id:'people',text:'How many people will be in the photos?',options:[
        {label:'Just me',points:{mini:1,standard:1}},
        {label:'2 to 4 people',points:{standard:2}},
        {label:'5 or more',points:{full:2}}]},
      {id:'time',text:'How much time do you want to spend?',options:[
        {label:'As little as possible',points:{mini:2}},
        {label:'About an hour or two',points:{standard:2}},
        {label:'Half a day or more',points:{full:2}}]}
    ]
  };
  function score(config,answers){
    const scores={};
    config.packages.forEach(p=>{scores[p.id]=0;});
    config.questions.forEach(q=>{
      const a=answers[q.id];
      if(a===undefined||a===null||a==='')throw new Error('Answer every question ('+q.id+' is missing).');
      const idx=Number(a);
      if(!Number.isInteger(idx)||idx<0||idx>=q.options.length)throw new Error('Invalid answer for '+q.id+'.');
      const pts=q.options[idx].points;
      Object.keys(pts).forEach(id=>{
        if(!(id in scores))throw new Error('Unknown package '+id+'.');
        scores[id]+=pts[id];
      });
    });
    // Ranking: higher score first; ties keep the order packages are listed in.
    const ranked=config.packages.map((p,i)=>({id:p.id,score:scores[p.id],i}))
      .sort((a,b)=>b.score-a.score||a.i-b.i);
    const tie=ranked.length>1&&ranked[0].score===ranked[1].score;
    return {scores,winnerId:ranked[0].id,tie,ranked:ranked.map(r=>r.id)};
  }
  return {CONFIG,score};
});
