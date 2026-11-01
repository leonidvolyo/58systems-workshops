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
      {id:'mini',name:'Мини-сессия',text:'30 минут, 10 обработанных фото. Для быстрого портрета.'},
      {id:'standard',name:'Стандарт',text:'1,5 часа, 30 обработанных фото. Подходит большинству.'},
      {id:'full',name:'Большая съёмка',text:'4 часа, 80 обработанных фото и 2 локации. Для событий и семей.'}
    ],
    questions:[
      {id:'purpose',text:'Для чего вам фотографии?',options:[
        {label:'Аватар или профиль',points:{mini:2}},
        {label:'Соцсети и сайт',points:{standard:2}},
        {label:'Семейное событие или свадьба',points:{full:2}}]},
      {id:'people',text:'Сколько человек будет на фото?',options:[
        {label:'Только я',points:{mini:1,standard:1}},
        {label:'От 2 до 4 человек',points:{standard:2}},
        {label:'5 и больше',points:{full:2}}]},
      {id:'time',text:'Сколько времени вы готовы потратить?',options:[
        {label:'Как можно меньше',points:{mini:2}},
        {label:'Час-два',points:{standard:2}},
        {label:'Полдня и больше',points:{full:2}}]}
    ]
  };
  function score(config,answers){
    const scores={};
    config.packages.forEach(p=>{scores[p.id]=0;});
    config.questions.forEach(q=>{
      const a=answers[q.id];
      if(a===undefined||a===null||a==='')throw new Error('Ответьте на все вопросы.');
      const idx=Number(a);
      if(!Number.isInteger(idx)||idx<0||idx>=q.options.length)throw new Error('Неверный ответ на вопрос.');
      const pts=q.options[idx].points;
      Object.keys(pts).forEach(id=>{
        if(!(id in scores))throw new Error('Неизвестный пакет: '+id+'.');
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
