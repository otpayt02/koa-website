const root=document.documentElement,body=document.body,header=document.querySelector('[data-header]');
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));

const film=document.querySelector('[data-film]');const scenes=[...document.querySelectorAll('[data-scene]')];const frame=document.querySelector('[data-frame]');const dots=[...document.querySelectorAll('.chapter-dots li')];
const identity=document.querySelector('[data-identity]'),identityLockup=document.querySelector('[data-identity-lockup]'),identityCaption=document.querySelector('[data-identity-caption]'),identityInstruction=document.querySelector('[data-identity-instruction]'),seal=document.querySelector('[data-seal]'),sealRays=document.querySelector('[data-seal-rays]'),sealTypeRing=document.querySelector('[data-seal-type-ring]'),ditherField=document.querySelector('[data-dither-field]'),depthField=document.querySelector('[data-depth-field]');
const smoothstep=value=>{const t=clamp(value);return t*t*(3-2*t)};
const openingHold=.04;
const cinematicProgress=raw=>clamp((raw-openingHold)/(1-openingHold));
const rawProgress=progress=>openingHold+clamp(progress)*(1-openingHold);
const mix=(a,b,t)=>a+(b-a)*t;
const glyphAlphabet=[...'ကညီပှၤတဝၢလၢအမဲရကၤအိၣ်ဃူအိၣ်ဖိး'];
let seed=7102018;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const glyphStates=[];

function letterPoints(letter){
  const points=[];
  if(letter==='k'){
    for(let i=0;i<13;i++)points.push({x:-.42,y:-1+i/6});
    for(let i=0;i<9;i++){const t=i/8;points.push({x:-.34+t*.82,y:-t});points.push({x:-.34+t*.82,y:t})}
  }else{
    for(let i=0;i<12;i++){const t=i/11;points.push({x:-.52+t*.52,y:1-t*2});points.push({x:.52-t*.52,y:1-t*2})}
    for(let i=0;i<7;i++)points.push({x:-.31+i*.103,y:.2})
  }
  return points;
}

function buildIdentityGlyphs(){
  document.querySelectorAll('[data-glyph-letter]').forEach(container=>{
    const points=letterPoints(container.dataset.glyphLetter);
    points.forEach((point,index)=>{
      const glyph=document.createElement('span');glyph.className='identity-glyph';glyph.textContent=glyphAlphabet[(index+Math.floor(random()*glyphAlphabet.length))%glyphAlphabet.length];container.append(glyph);
      glyphStates.push({glyph,container,point,startX:(random()-.5)*innerWidth*1.45,startY:(random()-.5)*innerHeight*1.35,scatterX:(random()-.5)*innerWidth*.9,scatterY:(random()-.5)*innerHeight*.75,twist:(random()-.5)*240,scale:.68+random()*.72});
    });
  });
  if(sealTypeRing){
    const ringText=[...'KAREN • ORGANIZATION • OF • AMERICA • ကညီ •'];
    ringText.forEach((character,index)=>{const span=document.createElement('span');span.textContent=character;span.style.setProperty('--ring-angle',`${index/ringText.length}turn`);sealTypeRing.append(span)});
  }
  if(depthField){
    const count=innerWidth<760?12:24;
    for(let i=0;i<count;i++){const glyph=document.createElement('span');glyph.textContent=glyphAlphabet[i%glyphAlphabet.length];glyph.style.cssText=`--x:${(random()*100).toFixed(2)}%;--y:${(random()*100).toFixed(2)}%;--size:${(.55+random()*2.4).toFixed(2)}rem;--alpha:${(.06+random()*.2).toFixed(2)};--blur:${(random()*4).toFixed(2)}px;--drift:${(12+random()*22).toFixed(2)}s;--delay:${(-random()*24).toFixed(2)}s`;depthField.append(glyph)}
  }
  if(ditherField){
    const columns=innerWidth<760?8:16,rows=innerWidth<760?6:7,bayer=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
    for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){const i=row*columns+column,glyph=document.createElement('span');glyph.textContent=glyphAlphabet[i%glyphAlphabet.length];const x=4+column/(columns-1)*92,y=5+row/(rows-1)*90;glyph.dataset.x=x.toFixed(2);glyph.dataset.y=y.toFixed(2);glyph.dataset.threshold=String(bayer[(row%4)*4+column%4]/16);glyph.style.left=`${x}%`;glyph.style.top=`${y}%`;glyph.style.opacity='.035';ditherField.append(glyph)}
  }
}
buildIdentityGlyphs();

let pointerFrame=0,pointerX=-9999,pointerY=-9999;
function renderDither(){pointerFrame=0;if(!ditherField||root.dataset.motion==='reduced')return;const bounds=ditherField.getBoundingClientRect(),radius=Math.min(285,Math.max(175,innerWidth*.21));ditherField.querySelectorAll('span').forEach(glyph=>{const x=bounds.left+bounds.width*Number(glyph.dataset.x)/100,y=bounds.top+bounds.height*Number(glyph.dataset.y)/100,distance=Math.hypot(pointerX-x,pointerY-y),strength=smoothstep(1-distance/radius),threshold=Number(glyph.dataset.threshold||0),dither=clamp((strength-threshold*.25)*1.35);glyph.style.opacity=String(.035+dither*.93);glyph.style.transform=`translate(-50%,-50%) scale(${.82+dither*.42})`})}
film?.addEventListener('pointermove',event=>{pointerX=event.clientX;pointerY=event.clientY;if(!pointerFrame)pointerFrame=requestAnimationFrame(renderDither)},{passive:true});
film?.addEventListener('pointerleave',()=>{pointerX=-9999;pointerY=-9999;if(!pointerFrame)pointerFrame=requestAnimationFrame(renderDither)},{passive:true});

let animationFrame=0;
function readFilmProgress(){if(!film)return 0;const max=Math.max(1,film.offsetHeight-innerHeight);return clamp((scrollY-film.offsetTop)/max)}
function renderIdentity(progress){
  if(!identity)return;
  const assembly=smoothstep((progress-.035)/.245),sealReveal=smoothstep((progress-.11)/.19),rise=smoothstep((progress-.30)/.085),scatter=smoothstep((progress-.52)/.12),fade=1-smoothstep((progress-.535)/.105),dither=smoothstep((progress-.52)/.12);
  identity.style.setProperty('--identity-progress',String(progress));identity.style.setProperty('--dither-reveal',String(dither));
  if(identityLockup){identityLockup.style.transform=`translate3d(-50%,calc(-50% - ${rise*21}vh),0) scale(${1-rise*.34})`;identityLockup.style.opacity=String(1-smoothstep((progress-.61)/.055))}
  if(seal){seal.style.opacity=String(sealReveal*fade);seal.style.transform=`scale(${mix(1.38,1,sealReveal)})`}
  if(sealTypeRing){sealTypeRing.style.opacity=String(sealReveal*fade);sealTypeRing.style.transform=`rotate(${progress*180}deg)`}
  if(sealRays){sealRays.style.opacity=String(sealReveal*.72*fade);sealRays.style.transform=`rotate(${-progress*92}deg) scale(${mix(.78,1,sealReveal)})`}
  if(identityCaption){identityCaption.style.opacity=String(smoothstep((progress-.19)/.08)*(1-smoothstep((progress-.47)/.07)));identityCaption.style.transform=`translate3d(0,${(1-rise)*18}px,0)`}
  if(identityInstruction)identityInstruction.style.opacity=String(1-smoothstep(progress/.09));
  glyphStates.forEach(state=>{const width=state.container.clientWidth,height=state.container.clientHeight,targetX=state.point.x*width*.62,targetY=state.point.y*height*.43,x=mix(state.startX,targetX,assembly)+state.scatterX*scatter,y=mix(state.startY,targetY,assembly)+state.scatterY*scatter,opacity=(.12+assembly*.88)*(1-scatter);state.glyph.style.opacity=String(opacity);state.glyph.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(state.twist*(1-assembly)+state.twist*.7*scatter).toFixed(1)}deg) scale(${mix(state.scale,1,assembly).toFixed(3)})`});
}
function renderFilm(raw){if(!film||!scenes.length)return;const progress=cinematicProgress(raw),total=Number(film.dataset.total||2400),photoProgress=clamp((progress-.72)/.28),photoSpan=1/Math.max(1,scenes.length-1);root.style.setProperty('--progress',progress);if(frame)frame.textContent=String(Math.round(progress*total)).padStart(4,'0');renderIdentity(progress);scenes.forEach((scene,index)=>{let local,opacity,resolved;if(index===0){local=clamp(progress/.78);opacity=1-smoothstep((progress-.745)/.04);resolved=1}else{const sceneProgress=(photoProgress-(index-1)*photoSpan)/photoSpan;local=clamp(sceneProgress);const fadeIn=index===1?smoothstep(sceneProgress/.2):smoothstep((sceneProgress+.25)/.45),fadeOut=index===scenes.length-1?1:1-smoothstep((sceneProgress-.74)/.42);opacity=fadeIn*fadeOut;resolved=smoothstep((sceneProgress+.24)/.48)}scene.style.setProperty('--local',smoothstep(local));scene.style.setProperty('--resolved',resolved);scene.style.setProperty('--scene-scale',String(.986+resolved*.014));scene.style.opacity=String(opacity);scene.classList.toggle('active',opacity>.015);if(index>0)scene.querySelectorAll('[data-beat]').forEach((line,lineIndex)=>{const beat=smoothstep((local-lineIndex*.28)/.42),lineFade=lineIndex===0?1-smoothstep((local-.8)/.16):1;line.style.opacity=String(beat*lineFade);line.style.transform=`translate3d(0,${(1-beat)*46}px,0) scale(${.975+beat*.025})`});dots[index]?.classList.toggle('active',opacity>.45&&local<.96)});header?.classList.toggle('scrolled',scrollY>24)}
function requestFilm(){if(animationFrame)return;animationFrame=requestAnimationFrame(()=>{animationFrame=0;renderFilm(readFilmProgress())})}
renderFilm(readFilmProgress());addEventListener('scroll',requestFilm,{passive:true});addEventListener('resize',requestFilm);

function filmScrollTarget(progress){const max=Math.max(1,film.offsetHeight-innerHeight);return film.offsetTop+clamp(progress)*max}const chapterStops=[.025,.73,.80,.87,.94];dots.forEach((dot,index)=>{dot.tabIndex=0;dot.setAttribute('role','button');dot.setAttribute('aria-label',`Go to animated chapter ${index+1}`);const go=()=>scrollTo({top:filmScrollTarget(rawProgress(chapterStops[index]??.94)),behavior:'smooth'});dot.addEventListener('click',go);dot.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();go()}})});

const menu=document.querySelector('[data-menu]'),nav=document.querySelector('[data-nav]');menu?.addEventListener('click',()=>{const open=body.classList.toggle('nav-open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close':'Menu'});nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{body.classList.remove('nav-open');menu?.setAttribute('aria-expanded','false');if(menu)menu.textContent='Menu'}));

const dialogs=[...document.querySelectorAll('dialog')];function openDialog(dialog){dialog?.showModal();body.classList.add('dialog-open')}function closeDialog(dialog){dialog?.close();body.classList.remove('dialog-open')}document.querySelectorAll('[data-dialog-close]').forEach(button=>button.addEventListener('click',()=>closeDialog(button.closest('dialog'))));dialogs.forEach(dialog=>dialog.addEventListener('close',()=>body.classList.remove('dialog-open')));

const searchDialog=document.querySelector('[data-search-dialog]'),searchInput=document.querySelector('[data-search-input]'),searchResults=document.querySelector('[data-search-results]');const index=[['Home','The 2,400-frame national story','index.html'],['About KOA','History, vision, mission, and coalition','about.html'],['Programs','Civic education, community engagement, and humanitarian assistance','programs.html'],['Stories','Advocacy, culture, sport, and solidarity','stories.html'],['Contact','Email, Messenger, Facebook, and collaboration','contact.html']];function renderSearch(){if(!searchResults)return;const q=(searchInput?.value||'').trim().toLowerCase();searchResults.replaceChildren();index.filter(item=>!q||item.join(' ').toLowerCase().includes(q)).forEach(item=>{const link=document.createElement('a');link.href=item[2];const strong=document.createElement('strong');strong.textContent=item[0];const span=document.createElement('span');span.textContent=item[1];link.append(strong,span);searchResults.append(link)})}document.querySelectorAll('[data-search-open]').forEach(button=>button.addEventListener('click',()=>{openDialog(searchDialog);renderSearch();requestAnimationFrame(()=>searchInput?.focus())}));searchInput?.addEventListener('input',renderSearch);addEventListener('keydown',event=>{const typing=event.target instanceof HTMLInputElement||event.target instanceof HTMLTextAreaElement;if(event.key==='/'&&!typing&&!document.querySelector('dialog[open]')){event.preventDefault();openDialog(searchDialog);renderSearch();requestAnimationFrame(()=>searchInput?.focus())}if(event.key==='Escape'&&body.classList.contains('nav-open'))menu?.click()});

const motionButton=document.querySelector('[data-motion]');function setMotion(reduced){root.dataset.motion=reduced?'reduced':'full';motionButton?.setAttribute('aria-pressed',String(reduced));if(motionButton)motionButton.textContent=reduced?'Motion off':'Motion on';localStorage.setItem('koa-motion',reduced?'reduced':'full');requestFilm();if(!pointerFrame)pointerFrame=requestAnimationFrame(renderDither)}setMotion(localStorage.getItem('koa-motion')==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches);motionButton?.addEventListener('click',()=>setMotion(root.dataset.motion!=='reduced'));

const dictionaryInput=document.querySelector('[data-dictionary-input]');const dictionaryCards=[...document.querySelectorAll('[data-dictionary-term]')];dictionaryInput?.addEventListener('input',()=>{const query=dictionaryInput.value.trim().toLowerCase();dictionaryCards.forEach(card=>{card.hidden=Boolean(query&&!card.dataset.dictionaryTerm.toLowerCase().includes(query))})});

const tabButtons=[...document.querySelectorAll('[data-tab]')],tabPanels=[...document.querySelectorAll('[data-panel]')];function selectTab(index){tabButtons.forEach((item,i)=>{const selected=i===index;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1});tabPanels.forEach((panel,i)=>panel.hidden=i!==index)}tabButtons.forEach((button,index)=>{button.addEventListener('click',()=>selectTab(index));button.addEventListener('keydown',event=>{const next=event.key==='ArrowRight'||event.key==='ArrowDown'?index+1:event.key==='ArrowLeft'||event.key==='ArrowUp'?index-1:null;if(next!==null){event.preventDefault();const resolved=(next+tabButtons.length)%tabButtons.length;selectTab(resolved);tabButtons[resolved].focus()}})});

document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>openDialog(document.querySelector('[data-language-dialog]'))));

const revealTargets=[...document.querySelectorAll('.content-intro,.fact,.link-card,.photo-note,.contact-card,.review-row')];revealTargets.forEach(target=>target.classList.add('cinematic-reveal'));let revealFrame=0;function revealVisible(){revealFrame=0;revealTargets.forEach(target=>{const bounds=target.getBoundingClientRect();if(bounds.top<innerHeight*1.04&&bounds.bottom>0)target.classList.add('is-visible')})}if('IntersectionObserver'in window){const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}}),{rootMargin:'0px 0px -7% 0px',threshold:.04});revealTargets.forEach(target=>revealObserver.observe(target));addEventListener('scroll',()=>{if(!revealFrame)revealFrame=requestAnimationFrame(revealVisible)},{passive:true});revealVisible()}else{revealTargets.forEach(target=>target.classList.add('is-visible'))}
