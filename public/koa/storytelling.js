const root=document.documentElement,body=document.body,header=document.querySelector('[data-header]');
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));

/* Smoothstep for more natural easing */
const smoothstep=value=>{const t=clamp(value);return t*t*(3-2*t)};
/* Smootherstep for even more cinematic feel */
const smootherstep=value=>{const t=clamp(value);return t*t*t*(t*(t*6-15)+10)};

/* Slower cinematic pacing constants */
const openingHold=.05;       /* Hold first scene slightly longer */
const cinematicProgress=raw=>clamp((raw-openingHold)/(1-openingHold));
const rawProgress=progress=>openingHold+clamp(progress)*(1-openingHold);

let targetProgress=0,visualProgress=0,momentum=0,animationFrame=0,lastTarget=0,lastFrameTime=0;

/* Cursor tracking for micro-interactions */
let cursorX=.5,cursorY=.5;
function updateCursorPosition(x,y){
  const clampedX=clamp((x/window.innerWidth-.5)*1.2,-.5,.5);
  const clampedY=clamp((y/window.innerHeight-.5)*1.2,-.5,.5);
  cursorX+= (clampedX-cursorX)*0.08;
  cursorY+= (clampedY-cursorY)*0.08;
  root.style.setProperty('--pointer-x',cursorX.toFixed(4));
  root.style.setProperty('--pointer-y',cursorY.toFixed(4));
}
addEventListener('pointermove',e=>updateCursorPosition(e.clientX,e.clientY),{passive:true});

const film=document.querySelector('[data-film]');
const scenes=[...document.querySelectorAll('[data-scene]')];
const frame=document.querySelector('[data-frame]');
const dots=[...document.querySelectorAll('.chapter-dots li')];

function readFilmProgress(){
  if(!film)return 0;
  const max=Math.max(1,film.offsetHeight-innerHeight);
  return clamp((scrollY-film.offsetTop)/max);
}

function renderFilm(raw){
  if(!film||!scenes.length)return;
  const progress=cinematicProgress(raw);
  const total=Number(film.dataset.total||2400);
  const span=1/scenes.length;

  root.style.setProperty('--progress',progress.toFixed(5));
  root.style.setProperty('--momentum',String(clamp(Math.abs(momentum)*16,0,.35)));

  if(frame)frame.textContent=String(Math.round(progress*total)).padStart(4,'0');

  scenes.forEach((scene,index)=>{
    const sceneProgress=(progress-index*span)/span;
    const local=clamp(sceneProgress);
    const easedLocal=smoothstep(local);
    const resolved=smoothstep((sceneProgress+(index===0?.1:.18))/(index===0?.45:.52));

    /* Fade in/out curves - slower, more graceful */
    const fadeIn=index===0?1:smoothstep((sceneProgress+(index===1?.28:.36))/(index===1?.52:.6));
    const fadeOut=index===scenes.length-1?1:1-smoothstep((sceneProgress-(index===0?.75:.7))/(index===0?.45:.5));
    const opacity=fadeIn*fadeOut;

    scene.style.setProperty('--local',easedLocal.toFixed(5));
    scene.style.setProperty('--resolved',resolved.toFixed(5));
    scene.style.setProperty('--scene-scale',String(.986+resolved*.014));
    scene.style.setProperty('--soft-blur',`${((1-resolved)*2+Math.abs(momentum)*3.5).toFixed(2)}px`);
    scene.style.opacity=String(opacity);
    scene.classList.toggle('active',opacity>.006);

    /* Logo scene specific - HALO DIRECTLY TIED TO SCROLL */
    if(scene.classList.contains('logo-scene')){
      const reveal=clamp((local-.06)/.94);
      const finesse=1-Math.pow(1-reveal,2.5);
      /* This drives the halo rotation and scale in CSS */
      scene.style.setProperty('--logo-finesse',finesse.toFixed(5));
      scene.style.setProperty('--torch',smoothstep((local-.58)/.35).toFixed(5));
    }

    /* Beat text reveals - slower, more deliberate */
    scene.querySelectorAll('[data-beat]').forEach((line,lineIndex)=>{
      const beat=smoothstep((local-lineIndex*.24)/.48);
      const fade=lineIndex===0?1-smoothstep((local-.78)/.18):1;
      line.style.opacity=String(beat*fade);
      line.style.transform=`translate3d(0,${(1-beat)*42}px,0) scale(${.978+beat*.022})`;
    });

    dots[index]?.classList.toggle('active',opacity>.42&&local<.97);
  });

  header?.classList.toggle('scrolled',scrollY>28);
}

/* Physics-based smooth animation loop */
function animateFilm(time){
  const distance=targetProgress-visualProgress;
  const elapsed=lastFrameTime?Math.min(100,time-lastFrameTime):16.7;
  lastFrameTime=time;

  /* Momentum calculation for organic feel */
  momentum=momentum*.82+(targetProgress-lastTarget)*.18;
  lastTarget=targetProgress;

  /* Adaptive response - faster when far, slower when close */
  const response=Math.abs(distance)>.07?130:180;
  const alpha=1-Math.exp(-elapsed/response);

  visualProgress+=distance*alpha;
  renderFilm(visualProgress);

  if(Math.abs(distance)>.00008||Math.abs(momentum)>.00006){
    animationFrame=requestAnimationFrame(animateFilm);
  }else{
    visualProgress=targetProgress;
    momentum=0;
    lastFrameTime=0;
    renderFilm(visualProgress);
    animationFrame=0;
  }
}

function requestFilm(){
  targetProgress=readFilmProgress();
  if(!animationFrame){
    lastFrameTime=0;
    animationFrame=requestAnimationFrame(animateFilm);
  }
}

/* Pre-decode images for smoother first paint */
document.querySelectorAll('.scene-media img,.logo-original').forEach(image=>image.decode?.().catch(()=>{}));

targetProgress=visualProgress=readFilmProgress();
renderFilm(visualProgress);
addEventListener('scroll',requestFilm,{passive:true});
addEventListener('resize',requestFilm);

/* ===== CHAPTER NAVIGATION ===== */
function filmScrollTarget(progress){
  const max=Math.max(1,film.offsetHeight-innerHeight);
  return film.offsetTop+clamp(progress)*max;
}

function settleFilm(){
  if(!film||root.dataset.motion==='reduced'||!scenes.length)return;
  const max=Math.max(1,film.offsetHeight-innerHeight);
  const progress=cinematicProgress(clamp((scrollY-film.offsetTop)/max));
  const span=1/scenes.length;
  const targets=scenes.slice(0,-1).map((_,index)=>(index+.79)*span);
  const nearest=targets.reduce((best,target)=>Math.abs(target-progress)<Math.abs(best-progress)?target:best,targets[0]??progress);
  const distance=Math.abs(nearest-progress);
  document.querySelector('.film-meta')?.classList.toggle('magnet',distance<span*.07);
  if(distance>span*.006&&distance<span*.07){
    scrollTo({top:filmScrollTarget(rawProgress(nearest)),behavior:'smooth'});
  }
}
addEventListener('scrollend',settleFilm);

dots.forEach((dot,index)=>{
  dot.tabIndex=0;
  dot.setAttribute('role','button');
  dot.setAttribute('aria-label',`Go to animated chapter ${index+1}`);
  const go=()=>scrollTo({top:filmScrollTarget(rawProgress((index+.02)/scenes.length)),behavior:'smooth'});
  dot.addEventListener('click',go);
  dot.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){
      event.preventDefault();
      go();
    }
  });
});

/* ===== MOBILE MENU ===== */
const menu=document.querySelector('[data-menu]'),nav=document.querySelector('[data-nav]');
menu?.addEventListener('click',()=>{
  const open=body.classList.toggle('nav-open');
  menu.setAttribute('aria-expanded',String(open));
  menu.textContent=open?'Close':'Menu';
});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  body.classList.remove('nav-open');
  menu?.setAttribute('aria-expanded','false');
  if(menu)menu.textContent='Menu';
}));

/* ===== DIALOGS ===== */
const dialogs=[...document.querySelectorAll('dialog')];
function openDialog(dialog){
  dialog?.showModal();
  body.classList.add('dialog-open');
}
function closeDialog(dialog){
  dialog?.close();
  body.classList.remove('dialog-open');
}
document.querySelectorAll('[data-dialog-close]').forEach(button=>button.addEventListener('click',()=>closeDialog(button.closest('dialog'))));
dialogs.forEach(dialog=>dialog.addEventListener('close',()=>body.classList.remove('dialog-open')));

/* ===== SEARCH ===== */
const searchDialog=document.querySelector('[data-search-dialog]'),searchInput=document.querySelector('[data-search-input]'),searchResults=document.querySelector('[data-search-results]');
const index=[['Home','The 2,400-frame national story','index.html'],['About KOA','History, vision, mission, and coalition','about.html'],['Programs','Civic education, community engagement, and humanitarian assistance','programs.html'],['Stories','Advocacy, culture, sport, and solidarity','stories.html'],['Contact','Email, Messenger, Facebook, and collaboration','contact.html']];
function renderSearch(){
  if(!searchResults)return;
  const q=(searchInput?.value||'').trim().toLowerCase();
  searchResults.replaceChildren();
  index.filter(item=>!q||item.join(' ').toLowerCase().includes(q)).forEach(item=>{
    const link=document.createElement('a');
    link.href=item[2];
    const strong=document.createElement('strong');
    strong.textContent=item[0];
    const span=document.createElement('span');
    span.textContent=item[1];
    link.append(strong,span);
    searchResults.append(link);
  });
}
document.querySelectorAll('[data-search-open]').forEach(button=>button.addEventListener('click',()=>{
  openDialog(searchDialog);
  renderSearch();
  requestAnimationFrame(()=>searchInput?.focus());
}));
searchInput?.addEventListener('input',renderSearch);
addEventListener('keydown',event=>{
  const typing=event.target instanceof HTMLInputElement||event.target instanceof HTMLTextAreaElement;
  if(event.key==='/'&&!typing&&!document.querySelector('dialog[open]')){
    event.preventDefault();
    openDialog(searchDialog);
    renderSearch();
    requestAnimationFrame(()=>searchInput?.focus());
  }
  if(event.key==='Escape'&&body.classList.contains('nav-open'))menu?.click();
});

/* ===== MOTION TOGGLE ===== */
const motionButton=document.querySelector('[data-motion]');
function setMotion(reduced){
  root.dataset.motion=reduced?'reduced':'full';
  motionButton?.setAttribute('aria-pressed',String(reduced));
  if(motionButton)motionButton.textContent=reduced?'Motion off':'Motion on';
  localStorage.setItem('koa-motion',reduced?'reduced':'full');
}
setMotion(localStorage.getItem('koa-motion')==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches);
motionButton?.addEventListener('click',()=>setMotion(root.dataset.motion!=='reduced'));

/* ===== DICTIONARY ===== */
const dictionaryInput=document.querySelector('[data-dictionary-input]');
const dictionaryCards=[...document.querySelectorAll('[data-dictionary-term]')];
dictionaryInput?.addEventListener('input',()=>{
  const query=dictionaryInput.value.trim().toLowerCase();
  dictionaryCards.forEach(card=>{
    card.hidden=Boolean(query&&!card.dataset.dictionaryTerm.toLowerCase().includes(query));
  });
});

/* ===== TABS ===== */
const tabButtons=[...document.querySelectorAll('[data-tab]')],tabPanels=[...document.querySelectorAll('[data-panel]')];
function selectTab(index){
  tabButtons.forEach((item,i)=>{
    const selected=i===index;
    item.setAttribute('aria-selected',String(selected));
    item.tabIndex=selected?0:-1;
  });
  tabPanels.forEach((panel,i)=>panel.hidden=i!==index);
}
tabButtons.forEach((button,index)=>{
  button.addEventListener('click',()=>selectTab(index));
  button.addEventListener('keydown',event=>{
    const next=event.key==='ArrowRight'||event.key==='ArrowDown'?index+1:event.key==='ArrowLeft'||event.key==='ArrowUp'?index-1:null;
    if(next!==null){
      event.preventDefault();
      const resolved=(next+tabButtons.length)%tabButtons.length;
      selectTab(resolved);
      tabButtons[resolved].focus();
    }
  });
});

/* ===== LANGUAGE DIALOG ===== */
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>openDialog(document.querySelector('[data-language-dialog]'))));

/* ===== SCROLL REVEALS ===== */
const revealTargets=[...document.querySelectorAll('.content-intro,.fact,.link-card,.photo-note,.contact-card,.review-row')];
revealTargets.forEach(target=>target.classList.add('cinematic-reveal'));
let revealFrame=0;
function revealVisible(){
  revealFrame=0;
  revealTargets.forEach(target=>{
    const bounds=target.getBoundingClientRect();
    if(bounds.top<innerHeight*1.02&&bounds.bottom>0)target.classList.add('is-visible');
  });
}
if('IntersectionObserver'in window){
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },{rootMargin:'0px 0px -5% 0px',threshold:.03});
  revealTargets.forEach(target=>revealObserver.observe(target));
  addEventListener('scroll',()=>{
    if(!revealFrame)revealFrame=requestAnimationFrame(revealVisible);
  },{passive:true});
  revealVisible();
}else{
  revealTargets.forEach(target=>target.classList.add('is-visible'));
}