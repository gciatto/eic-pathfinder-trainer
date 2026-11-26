'use strict';
(() => {
  const QUESTIONS = window.OFFICIAL_QUIZZES || [];
  const STANDALONE = window.TRAINER_STANDALONE === true;
  const KEY = 'eic_pathfinder_challenges_2026_official_v1';
  const $ = id => document.getElementById(id);
  const PARTS = [
    {id:'A', title:'General Overview', short:'Programme fundamentals, evaluator conduct, conflicts of interest and open science.', count:13, startSlide:2, file:'EIC_Pathfinder_Part_A_Questions.pdf'},
    {id:'B', title:'Guidance for IER and CR', short:'Award criteria, scoring, reporting, methodology, implementation and consensus.', count:20, startSlide:60, file:'EIC_Pathfinder_Part_B_Questions.pdf'},
    {id:'C', title:'Additional Questions and Lump Sum Budget', short:'Scope, exceptional funding, stem cells and lump sum assessment.', count:11, startSlide:111, file:'EIC_Pathfinder_Part_C_Questions.pdf'},
    {id:'D', title:'Vice Chairs Rapporteurs', short:'IER quality control, CR drafting, moderation and consensus workflow.', count:16, startSlide:153, file:'EIC_Pathfinder_Part_D_Questions.pdf'},
    {id:'E', title:'VCPs · Individual Evaluation and Portfolio Building', short:'Panel cross-reading, minority views, categorisation and portfolio construction.', count:14, startSlide:201, file:'EIC_Pathfinder_VCPs_Questions.pdf'},
  ];
  const ANSWERS_FILE = 'EIC_Pathfinder_Consolidated_Answers.pdf';
  const SLIDES_FILE = 'EU_Academy-EIC_2026_Pathfinder_Challenges.pdf';
  const stateDefault = () => ({version:1, attempts:{}, bookmarks:[], sessions:0});
  function load(){try{const v=JSON.parse(localStorage.getItem(KEY));if(v && v.version===1 && v.attempts && typeof v.attempts==='object' && !Array.isArray(v.attempts) && Array.isArray(v.bookmarks))return v;}catch{}return stateDefault();}
  let progress = load(), session = null, view='home';
  const byId = new Map(QUESTIONS.map(q=>[q.id,q]));
  function save(){try{localStorage.setItem(KEY,JSON.stringify(progress));}catch{}}
  function make(tag,className,text){const x=document.createElement(tag);if(className)x.className=className;if(text!==undefined)x.textContent=text;return x;}
  function append(parent,...children){for(const c of children)parent.append(c);return parent;}
  function clear(root){root.replaceChildren();return root;}
  const has = (obj,k) => Object.prototype.hasOwnProperty.call(obj,k);
  const exact = (a,b) => Array.isArray(a) && a.length===b.length && a.every(x=>b.includes(x));
  function shuffle(a){let x=a.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
  function metric(value,label){const el=make('div','metric');return append(el,make('strong','',String(value)),make('span','',label));}
  function allAttempts(items=QUESTIONS){let right=0,total=0,practiced=0;for(const q of items){const a=progress.attempts[q.id];if(a){right+=a.correct;total+=a.correct+a.wrong;if(a.correct+a.wrong)practiced++;}}return {right,total,practiced,accuracy:total?Math.round(right/total*100):null};}
  function misses(){return QUESTIONS.filter(q=>progress.attempts[q.id]?.lastCorrect===false);}
  function bookmarks(){return QUESTIONS.filter(q=>progress.bookmarks.includes(q.id));}
  const partMeta=p=>PARTS.find(x=>x.id===p);
  const sourceHref=(filename,page)=>'materials/'+encodeURIComponent(filename)+(page?'#page='+page:'');
  const sourceLabel=q=>`Part ${q.part}, Q${q.number} · Question PDF p.${q.sourcePage} · Answer key p.${q.answerPage}`;
  function addSlideLinks(element,q){
    const info=make('div','feedback-source');
    info.append(make('span','','Relevant slides (PDF pages): '));
    q.slidePages.forEach((page,index)=>{
      if(index)info.append(document.createTextNode(' · '));
      const link=make('a','',`p.${page} ↗`);link.href=sourceHref(SLIDES_FILE,page);link.target='_blank';link.rel='noopener noreferrer';
      link.setAttribute('aria-label',`Open relevant lecture slides for ${q.id}, PDF page ${page} (new tab)`);info.append(link);
    });
    if(STANDALONE)info.append(make('span','',' (Requires the materials folder beside this HTML file.)'));
    element.append(info);
  }
  function addSourceLinks(element,q){
    const info=make('div','feedback-source');
    info.append(make('span','',sourceLabel(q)));
    if(!STANDALONE){
      info.append(document.createTextNode(' · '));
      const pdf=make('a','','Question PDF ↗');pdf.href=sourceHref(partMeta(q.part).file,q.sourcePage);pdf.target='_blank';pdf.rel='noopener noreferrer';info.append(pdf);
      info.append(document.createTextNode(' · '));
      const key=make('a','','Official answers ↗');key.href=sourceHref(ANSWERS_FILE,q.answerPage);key.target='_blank';key.rel='noopener noreferrer';info.append(key);
    }
    element.append(info);
    addSlideLinks(element,q);
  }
  function go(page){view=page;document.querySelectorAll('.page').forEach(x=>x.classList.toggle('hidden',x.id!=='page-'+page));document.querySelectorAll('[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
    if(page==='home')renderHome();if(page==='bank')renderBank();if(page==='progress')renderProgress();if(page==='settings')renderSettings();if(page==='practice')renderPractice();
    window.scrollTo({top:0,behavior:'instant'});
  }
  function selectPart(id){$('filter-part').value=id;$('focus-missed').checked=false;$('focus-bookmarks').checked=false;session=null;go('practice');}
  function renderSidebar(){for(const p of PARTS){const n=allAttempts(QUESTIONS.filter(q=>q.part===p.id)).practiced;document.querySelectorAll(`[data-part-done="${p.id}"]`).forEach(x=>x.textContent=String(n));}}
  function renderHome(){renderSidebar();const overall=allAttempts();clear($('home-metrics')).append(metric(QUESTIONS.length,'Official questions'),metric(PARTS.length,'Training parts'),metric(overall.accuracy===null?'—':overall.accuracy+'%','Lifetime accuracy'),metric(overall.practiced+'/74','Questions attempted'));
    const cards=clear($('part-cards'));
    for(const p of PARTS){const attempted=allAttempts(QUESTIONS.filter(q=>q.part===p.id)).practiced;const card=make('button','part-card');card.type='button';card.setAttribute('aria-label','Practice Part '+p.id+': '+p.title);card.onclick=()=>selectPart(p.id);
      const heading=append(make('div','part-card-heading'),make('b','',p.id),make('small','',`PART ${p.id} · ${p.count} QUESTIONS`));
      const foot=append(make('div','card-bottom'),make('span','',`${attempted} of ${p.count} practiced`),make('b','','Practice this part →'));
      cards.append(append(card,heading,make('strong','',p.title),make('p','',p.short),foot));
    }
  }
  function renderPractice(){const active=Boolean(session);$('session-setup').classList.toggle('hidden',active);$('session-playing').classList.add('hidden');$('session-results').classList.add('hidden');if(active)drawQuestion();}
  function begin(mode){let qs=QUESTIONS.filter(q=>$('filter-part').value==='all'||q.part===$('filter-part').value);
    if($('focus-missed').checked)qs=qs.filter(q=>progress.attempts[q.id]?.lastCorrect===false);
    if($('focus-bookmarks').checked)qs=qs.filter(q=>progress.bookmarks.includes(q.id));
    if(!qs.length){$('setup-message').textContent='No questions match this selection. Change the filters or practice first.';return;}
    if($('shuffle-questions').checked)qs=shuffle(qs);
    const count=$('session-count').value;qs=qs.slice(0,count==='all'?qs.length:Math.max(1,Number(count)));
    session={mode,ids:qs.map(q=>q.id),index:0,answers:{},checked:{},recorded:false};
    $('setup-message').textContent='';$('session-setup').classList.add('hidden');$('session-results').classList.add('hidden');$('session-playing').classList.remove('hidden');
    $('session-badge').textContent=mode==='exam'?'MOCK EXAM':'PRACTICE';$('session-scope').textContent=$('filter-part').value==='all'?'All five parts':'Part '+$('filter-part').value;
    drawQuestion();
  }
  function current(){return session?byId.get(session.ids[session.index]):null;}
  function choiceAt(){return session.answers[session.index]||[];}
  function checkedAt(){return has(session.checked,session.index);}
  function answeredCount(){return session.mode==='exam'?Object.values(session.answers).filter(a=>a.length>0).length:Object.keys(session.checked).length;}
  function drawQuestion(){
    if(!session)return;const q=current();if(!q)return;
    $('session-playing').classList.remove('hidden');$('session-setup').classList.add('hidden');$('session-results').classList.add('hidden');
    const index=session.index,done=answeredCount(),length=session.ids.length,chosen=choiceAt(),checked=checkedAt();
    $('session-progress-bar').style.width=String(Math.round(done/length*100))+'%';
    $('question-position').textContent=`QUESTION ${index+1} / ${length}`;$('answered-count').textContent=`${done} ${session.mode==='exam'?'SELECTED':'CHECKED'}`;
    $('question-label').textContent=`PART ${q.part} · QUESTION ${q.number} · ${partMeta(q.part).title.toUpperCase()}`;
    $('question-kind').textContent=q.answers.length>1?'SELECT ALL THAT APPLY':'SELECT ONE';
    $('question-text').textContent=q.question;
    addSlideLinks(clear($('question-slides')),q);
    $('bookmark-question').textContent=(progress.bookmarks.includes(q.id)?'★ Bookmarked':'☆ Bookmark question');
    const answers=clear($('answer-list'));
    for(const [letter,text] of Object.entries(q.options)){
      const option=make('button','answer-option');option.type='button';option.setAttribute('aria-pressed',chosen.includes(letter)?'true':'false');
      if(chosen.includes(letter))option.classList.add('selected');
      if(checked&&session.mode==='practice'){
        if(q.answers.includes(letter))option.classList.add('correct');
        else if(chosen.includes(letter))option.classList.add('incorrect');
      }
      option.disabled=checked;
      option.append(make('span','answer-letter',letter),make('span','',text));
      option.onclick=()=>{if(checked)return;let selected=choiceAt().slice();if(q.answers.length>1){selected=selected.includes(letter)?selected.filter(k=>k!==letter):[...selected,letter].sort();}else selected=[letter];session.answers[index]=selected;drawQuestion();};
      answers.append(option);
    }
    $('previous-question').disabled=index===0;
    $('check-question').disabled=chosen.length===0;
    $('check-question').classList.toggle('hidden',checked&&session.mode==='practice');
    $('check-question').textContent=session.mode==='exam'?(index===length-1?'Submit exam →':'Next question →'):'Check answer →';
    $('next-question').classList.toggle('hidden',!checked||session.mode==='exam');
    $('next-question').textContent=index===length-1?'Complete session →':'Next question →';
    const panel=$('feedback');panel.classList.toggle('hidden',!checked||session.mode==='exam');
    if(checked&&session.mode==='practice')showFeedback(panel,q,chosen);
  }
  function renderAnswerKey(parent,q){const label=make('div','answer-key',`Official answer: ${q.answers.join(' + ')}`);const ul=make('ul');for(const letter of q.answers)ul.append(make('li','',letter+'. '+q.options[letter]));label.append(ul);parent.append(label);}
  function showFeedback(panel,q,chosen){const correct=exact(chosen,q.answers);panel.className='feedback'+(correct?'':' bad');clear(panel).append(make('strong','',correct?'✓ Correct answer':'✕ Incorrect answer'));
    if(!correct)panel.append(make('p','','Your choice: '+chosen.map(k=>k+'. '+q.options[k]).join(' / ')));
    renderAnswerKey(panel,q);addSourceLinks(panel,q);
  }
  function record(q,selected){const ok=exact(selected,q.answers);const x=progress.attempts[q.id]||{correct:0,wrong:0,lastCorrect:null};x[ok?'correct':'wrong']++;x.lastCorrect=ok;progress.attempts[q.id]=x;save();return ok;}
  function check(){if(!session)return;const idx=session.index,q=current(),selected=choiceAt();if(!selected.length)return;
    if(session.mode==='exam'){if(idx===session.ids.length-1){finish();}else{session.index++;drawQuestion();}return;}
    if(checkedAt())return;
    record(q,selected);session.checked[idx]=true;drawQuestion();
  }
  function next(){if(!session)return;if(session.index===session.ids.length-1){finish();}else{session.index++;drawQuestion();}}
  function finish(){if(!session||session.recorded)return;
    if(session.mode==='exam'){
      const incomplete=session.ids.some((id,index)=>!session.answers[index]?.length);
      if(incomplete&&!window.confirm('Some questions are unanswered and will count as incorrect. Submit anyway?'))return;
      session.ids.forEach((id,index)=>record(byId.get(id),session.answers[index]||[]));
    }
    session.recorded=true;progress.sessions=(progress.sessions||0)+1;save();
    $('session-playing').classList.add('hidden');$('session-results').classList.remove('hidden');showResults();window.scrollTo({top:0,behavior:'instant'});
  }
  function showResults(){const rows=session.ids.map((id,index)=>({q:byId.get(id),chosen:session.answers[index]||[]}));const rights=rows.filter(x=>exact(x.chosen,x.q.answers)).length,wrong=rows.length-rights;
    $('results-intro').textContent=`${session.mode==='exam'?'Mock exam':'Practice'} finished. Results are based only on the official 2026 answer sheet.`;
    clear($('result-metrics')).append(metric(rights+'/'+rows.length,'Correct'),metric(Math.round(rights/rows.length*100)+'%','Session accuracy'),metric(wrong,'Incorrect or skipped'),metric(rows.length,'Questions reviewed'));
    const root=clear($('results-review'));
    for(const {q,chosen} of rows){const good=exact(chosen,q.answers),row=make('article','result-row');row.append(make('strong',good?'good':'bad',(good?'✓ ':'✕ ')+q.id+' · '+q.question));
      row.append(make('small','','Your answer: '+(chosen.length?chosen.map(k=>k+'. '+q.options[k]).join(' / '):'(unanswered)')));
      row.append(make('small','','Official answer: '+q.answers.map(k=>k+'. '+q.options[k]).join(' / ')));
      addSourceLinks(row,q);root.append(row);
    }
    renderSidebar();
  }
  function renderBank(){const term=$('search-questions').value.trim().toLowerCase(),part=$('bank-part').value;
    const xs=QUESTIONS.filter(q=>(part==='all'||q.part===part)&&[q.question,...Object.values(q.options),q.title].some(s=>s.toLowerCase().includes(term)));
    $('bank-summary').textContent=`Showing ${xs.length} of 74 source questions`;
    const root=clear($('bank-results'));
    for(const q of xs){const card=make('article','bank-card');card.append(make('div','bank-meta',`PART ${q.part} · QUESTION ${q.number} ${q.answers.length>1?'· MULTIPLE ANSWERS':''}`),make('h3','',q.question));
      const det=make('details');det.append(make('summary','','Show answer key and options'));
      for(const [k,v] of Object.entries(q.options))det.append(make('p','bank-option'+(q.answers.includes(k)?' key':''),k+'. '+v));
      det.append(make('p','bank-option key','Correct: '+q.answers.join(' + ')));const source=make('div','bank-source');addSourceLinks(source,q);det.append(source);card.append(det);addSlideLinks(card,q);root.append(card);
    }
  }
  function renderProgress(){renderSidebar();const a=allAttempts();clear($('progress-metrics')).append(metric(a.total,'Answers submitted'),metric(a.accuracy===null?'—':a.accuracy+'%','Lifetime accuracy'),metric(progress.sessions||0,'Completed sessions'),metric(misses().length,'To revisit'));
    const bars=clear($('part-progress-bars'));
    for(const p of PARTS){const qs=QUESTIONS.filter(q=>q.part===p.id),x=allAttempts(qs),row=make('div','progress-row');const top=append(make('div','progress-top'),make('strong','',`Part ${p.id} · ${p.title}`),make('span','',`${x.practiced}/${p.count} attempted`));const bar=make('div','progressbar');const fill=make('div');fill.style.width=Math.round(100*x.practiced/p.count)+'%';bar.append(fill);row.append(top,bar,make('div','progress-caption',x.accuracy===null?'No answers yet':`Accuracy ${x.accuracy}% across ${x.total} answers`));bars.append(row);}
    displaySimple($('missed-items'),misses(),'No outstanding mistakes.');displaySimple($('bookmarked-items'),bookmarks(),'No bookmarked questions yet.');$('retry-missed').disabled=misses().length===0;
  }
  function displaySimple(root,items,empty){clear(root);if(!items.length){root.append(make('p','muted',empty));return;}for(const q of items){const row=make('div','simple-question');row.append(make('strong','',q.question),make('small','',`Part ${q.part} · Question ${q.number}`));root.append(row);}}
  function renderSettings(){const root=clear($('sources-list'));for(const p of PARTS){const row=make('div','source-row');const info=make('div');info.append(make('strong','',`Part ${p.id} · ${p.title}`),make('small','',`${p.count} questions · Lecture starts on slide ${p.startSlide}`));row.append(info);if(!STANDALONE){const l=make('a','','Open PDF ↗');l.href=sourceHref(p.file);l.target='_blank';l.rel='noopener noreferrer';row.append(l);}root.append(row);}
    for(const [filename,label] of [[ANSWERS_FILE,'Consolidated official answer key'],[SLIDES_FILE,'EIC Academy lecture deck · 213 slides']]){
      const row=make('div','source-row'),info=make('div');info.append(make('strong','',label),make('small','',filename));row.append(info);if(!STANDALONE){const l=make('a','','Open PDF ↗');l.href=sourceHref(filename);l.target='_blank';l.rel='noopener noreferrer';row.append(l);}root.append(row);
    }
    if(STANDALONE)root.append(make('p','muted','The complete source PDFs are available in the ZIP project; this single-file app embeds only the complete question bank and answer keys.'));
  }
  function download(name,value){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=make('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function restore(obj){if(!obj||obj.version!==1||!obj.attempts||typeof obj.attempts!=='object'||Array.isArray(obj.attempts)||!Array.isArray(obj.bookmarks))throw Error('Unrecognised backup schema.');
    const clean=stateDefault();clean.bookmarks=[...new Set(obj.bookmarks.filter(x=>typeof x==='string'&&byId.has(x)))];clean.sessions=Number.isSafeInteger(obj.sessions)&&obj.sessions>=0?obj.sessions:0;
    for(const [id,v] of Object.entries(obj.attempts)){if(!byId.has(id))continue;if(v&&Number.isSafeInteger(v.correct)&&v.correct>=0&&Number.isSafeInteger(v.wrong)&&v.wrong>=0){clean.attempts[id]={correct:v.correct,wrong:v.wrong,lastCorrect:typeof v.lastCorrect==='boolean'?v.lastCorrect:null};}}
    progress=clean;save();renderSidebar();
  }
  function init(){if(QUESTIONS.length!==74){document.body.prepend(make('p','',`Question bank error: expected 74 questions, got ${QUESTIONS.length}.`));return;}
    document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{session=null;go(b.dataset.page);});
    document.querySelectorAll('[data-start-part]').forEach(b=>b.onclick=()=>selectPart(b.dataset.startPart));
    $('brand-home').onclick=()=>{session=null;go('home');};
    $('quick-practice').onclick=()=>{selectPart('all');begin('practice');};
    $('quick-exam').onclick=()=>{selectPart('all');begin('exam');};
    $('start-practice').onclick=()=>begin('practice');$('start-exam').onclick=()=>begin('exam');
    $('check-question').onclick=check;$('next-question').onclick=next;
    $('previous-question').onclick=()=>{if(session&&session.index>0){session.index--;drawQuestion();}};
    $('bookmark-question').onclick=()=>{if(!session)return;const id=current().id;progress.bookmarks=progress.bookmarks.includes(id)?progress.bookmarks.filter(x=>x!==id):[...progress.bookmarks,id];save();drawQuestion();};
    $('abandon-session').onclick=()=>{if(!window.confirm('Exit this session? Already checked practice answers remain in your statistics.'))return;session=null;renderPractice();};
    $('new-session').onclick=()=>{session=null;renderPractice();};$('go-to-progress').onclick=()=>{session=null;go('progress');};
    $('search-questions').oninput=renderBank;$('bank-part').onchange=renderBank;
    $('retry-missed').onclick=()=>{selectPart('all');$('focus-missed').checked=true;};
    $('export-progress').onclick=()=>download('eic-pathfinder-challenges-2026-progress.json',{...progress,exportedAt:new Date().toISOString()});
    $('export-bank').onclick=()=>download('eic-pathfinder-challenges-2026-questions.json',QUESTIONS);
    $('import-progress').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{restore(JSON.parse(await f.text()));$('backup-message').textContent='Progress restored successfully.';}catch(err){$('backup-message').textContent='Import failed: '+err.message;}e.target.value='';};
    $('reset-progress').onclick=()=>{if(window.confirm('Permanently erase locally stored answers and bookmarks?')){progress=stateDefault();save();$('backup-message').textContent='Local progress reset.';renderSidebar();}};
    document.addEventListener('keydown',e=>{if(!session||view!=='practice'||$('session-playing').classList.contains('hidden')||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,select,textarea'))return;
      if(e.key>='1'&&e.key<='5'&&!checkedAt()){const q=current(),k=String.fromCharCode(64+Number(e.key));if(has(q.options,k)){let x=choiceAt().slice();if(q.answers.length>1)x=x.includes(k)?x.filter(y=>y!==k):[...x,k].sort();else x=[k];session.answers[session.index]=x;drawQuestion();}}
      if(e.key==='Enter'&&e.target===document.body){if(!$('check-question').classList.contains('hidden')&&!$('check-question').disabled)check();else if(!$('next-question').classList.contains('hidden'))next();}
    });
    go('home');
  }
  init();
})();
