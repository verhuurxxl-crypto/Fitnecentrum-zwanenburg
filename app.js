const nav=document.querySelector('#navigation');
const menu=document.querySelector('.menu-toggle');
const siteHeader=document.querySelector('body>header');
const megaToggle=document.querySelector('#mega-toggle');
const megaPanel=document.querySelector('#mega-panel');
const backdrop=document.querySelector('.mega-backdrop');
let hoverOpenTimer,hoverCloseTimer;
const isMobileMenu=()=>window.innerWidth<=1050;
function updateBackdrop(){backdrop.hidden=megaPanel.hidden&&!nav.classList.contains('open');}
function closeMega(restoreFocus=false){clearTimeout(hoverOpenTimer);clearTimeout(hoverCloseTimer);megaPanel.hidden=true;megaToggle.setAttribute('aria-expanded','false');siteHeader.classList.remove('mega-is-open');document.body.classList.remove('mega-open');updateBackdrop();if(restoreFocus)megaToggle.focus();}
function closeMenu(restoreFocus=false){closeMega();nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Menu openen');menu.textContent='☰';document.body.classList.remove('menu-open');updateBackdrop();if(restoreFocus)(isMobileMenu()?menu:megaToggle).focus();}
function openMega(keyboard=false){clearTimeout(hoverOpenTimer);clearTimeout(hoverCloseTimer);megaPanel.hidden=false;megaToggle.setAttribute('aria-expanded','true');siteHeader.classList.add('mega-is-open');document.body.classList.add('mega-open');if(isMobileMenu()){nav.classList.add('open');document.body.classList.add('menu-open');menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','Menu sluiten');menu.textContent='×';}updateBackdrop();if(keyboard)megaPanel.querySelector('a').focus();}
menu.setAttribute('aria-controls','navigation mega-panel');
menu.addEventListener('click',()=>{if(nav.classList.contains('open')||!megaPanel.hidden){closeMenu(true);return;}nav.classList.add('open');document.body.classList.add('menu-open');menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','Menu sluiten');menu.textContent='×';updateBackdrop();nav.querySelector('button,a').focus();});
megaToggle.addEventListener('click',e=>{if(!megaPanel.hidden)closeMega(e.detail===0);else openMega(e.detail===0);});
megaToggle.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse'||isMobileMenu())return;clearTimeout(hoverCloseTimer);hoverOpenTimer=setTimeout(()=>openMega(),160);});
siteHeader.addEventListener('pointerleave',e=>{if(e.pointerType!=='mouse'||isMobileMenu())return;clearTimeout(hoverOpenTimer);hoverCloseTimer=setTimeout(()=>{if(!megaPanel.contains(document.activeElement))closeMega();},240);});
megaPanel.addEventListener('pointerenter',()=>{clearTimeout(hoverOpenTimer);clearTimeout(hoverCloseTimer);});
megaPanel.querySelector('.mega-close').addEventListener('click',()=>closeMega(true));
backdrop.addEventListener('click',()=>closeMenu(true));
siteHeader.querySelectorAll('a:not([data-service])').forEach(a=>a.addEventListener('click',()=>closeMenu()));
document.addEventListener('keydown',e=>{const anyMenuOpen=!megaPanel.hidden||nav.classList.contains('open');if(!anyMenuOpen)return;if(e.key==='Escape'){e.preventDefault();closeMenu(true);return;}if(e.key==='Tab'){const focusables=[...siteHeader.querySelectorAll('a,button,input')].filter(el=>!el.disabled&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
function syncHeader(){document.documentElement.style.setProperty('--nav-height',siteHeader.offsetHeight+'px');siteHeader.classList.toggle('scrolled',window.scrollY>35);}
let mobileMenuState=isMobileMenu();window.addEventListener('resize',()=>{const next=isMobileMenu();if(next!==mobileMenuState){closeMenu();mobileMenuState=next;}syncHeader();});window.addEventListener('scroll',syncHeader,{passive:true});syncHeader();
const motion=document.querySelector('#motion');motion.addEventListener('click',()=>{const paused=document.body.classList.toggle('paused');motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?'Animaties hervatten':'Animaties pauzeren');motion.innerHTML=(paused?'▶':'Ⅱ')+' <span>'+(paused?'Beweging hervatten':'Beweging pauzeren')+'</span>';});
const sessions=[
[['08:30 – 09:30','Circuit training','Cardiozaal'],['12:00 – 13:00','Kickboksen','Groepslessenzaal'],['17:00 – 18:00','Jeugd kickboksen','Groepslessenzaal'],['19:00 – 20:00','Zumba','Groepslessenzaal'],['19:30 – 20:30','Circuit training','Cardiozaal'],['20:30 – 21:30','Kickboksen · zaktraining','Groepslessenzaal']],
[['12:00 – 13:00','Kickboksen · zaktraining','Groepslessenzaal'],['18:00 – 19:00','Jeugd kickboksen','Groepslessenzaal']],
[['08:30 – 09:30','Circuit training','Cardiozaal'],['12:00 – 13:00','Kickboksen · zaktraining','Groepslessenzaal'],['19:30 – 20:30','Circuit training','Cardiozaal'],['20:00 – 21:00','Zumba','Groepslessenzaal'],['20:30 – 21:30','Kickboksen · zaktraining','Groepslessenzaal']],
[['08:30 – 09:30','Circuit training','Cardiozaal'],['12:00 – 13:00','Kickboksen · zaktraining','Groepslessenzaal'],['18:45 – 19:00','Buikspierkwartier','Groepslessenzaal'],['19:00 – 20:00','Circuit training','Cardiozaal'],['20:00 – 21:00','Kickboksen · zaktraining','Groepslessenzaal']],
[['09:30 – 10:30','Kickboksen · zaktraining','Groepslessenzaal'],['20:00 – 21:30','Kickboksen','Groepslessenzaal']]
];
function renderDay(day){document.querySelector('#lessons').innerHTML=sessions[day].map(([time,name,room])=>`<article class="lesson"><time>${time}</time><h3>${name}</h3><span class="room">${room}</span><a href="#proefles" aria-label="Kennismaken met ${name}">↗</a></article>`).join('');}
document.querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-day]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderDay(Number(b.dataset.day));}));if(document.querySelector('#lessons'))renderDay(0);
const serviceData=window.FCZ_SERVICES||[];
const serviceById=new Map(serviceData.map(s=>[s.id,s]));
const serviceGroups={fitness:'FITNESS & COACHING',lessen:'GROEPSLESSEN',sport:'VECHTSPORT & JEUGD',extra:'MEER BIJ DE CLUB'};
const training=document.querySelector('#training-detail');
let serviceReturnFocus=null;
function filterServices(category){let count=0;document.querySelectorAll('.service-tile').forEach(card=>{card.hidden=category!=='all'&&card.dataset.category!==category;if(!card.hidden)count++;});document.querySelectorAll('[data-filter]').forEach(button=>{const active=button.dataset.filter===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});document.querySelector('#catalog-count').textContent=count+' mogelijkheden';}
function showService(id,source){const service=serviceById.get(id);if(!service)return;serviceReturnFocus=source?.closest('header')?megaToggle:source;closeMenu();filterServices(service.category);document.querySelector('#detail-title').textContent=service.name;document.querySelector('#detail-tag').textContent=service.tag;document.querySelector('#detail-copy').textContent=service.text;document.querySelector('#detail-category').textContent=serviceGroups[service.category];const photo=document.querySelector('#detail-image');photo.src='/assets/'+service.image;photo.alt='Trainingsruimte van Fitnesscentrum Zwanenburg';training.showModal();document.body.classList.add('modal-open');}
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();showService(link.dataset.service,link);}));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>filterServices(button.dataset.filter)));
document.querySelectorAll('[data-filter-jump]').forEach(link=>link.addEventListener('click',()=>filterServices(link.dataset.filterJump)));
document.querySelector('#detail-cta').addEventListener('click',()=>{serviceReturnFocus=null;training.close();});
training.addEventListener('close',()=>{if(serviceReturnFocus?.isConnected)serviceReturnFocus.focus({preventScroll:true});serviceReturnFocus=null;});
document.querySelector('#privacy-open')?.addEventListener('click',()=>{document.querySelector('#privacy').showModal();document.body.classList.add('modal-open');});
document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.dialog-close').addEventListener('click',()=>d.close());d.addEventListener('close',()=>document.body.classList.remove('modal-open'));d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close();});});

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
 const observer = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}), {threshold: 0.08});
 document.querySelectorAll('.section-heading,.club-copy,.club-photo,.contact-right').forEach(el => {el.classList.add('reveal-ready');observer.observe(el);});
}

const heroEl=document.querySelector('.experience');
if(heroEl && matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches){
 heroEl.addEventListener('pointermove',e=>{if(document.body.classList.contains('paused'))return;const r=heroEl.getBoundingClientRect();heroEl.style.setProperty('--art-x',((e.clientX-r.left)/r.width-.5)*18+'px');heroEl.style.setProperty('--art-y',((e.clientY-r.top)/r.height-.5)*12+'px');});
 heroEl.addEventListener('pointerleave',()=>{heroEl.style.setProperty('--art-x','0px');heroEl.style.setProperty('--art-y','0px');});
}
const stickyJoin=document.querySelector('.mobile-sticky-join');
if(stickyJoin&&heroEl){new IntersectionObserver(entries=>{stickyJoin.classList.toggle('show',!entries[0].isIntersecting);},{threshold:0}).observe(heroEl);}

// Calm, controllable movement through the club's own photographs.
const sceneImages=[...document.querySelectorAll('.scene-image')];
const sceneButtons=[...document.querySelectorAll('[data-scene]')];
let sceneIndex=0,sceneLastChanged=Date.now();
function changeScene(index){if(!sceneImages[index]?.complete||!sceneImages[index]?.naturalWidth)return;sceneIndex=index;sceneLastChanged=Date.now();sceneImages.forEach((img,i)=>img.classList.toggle('active',i===index));sceneButtons.forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index));});const progress=document.querySelector('.scene-progress>span');if(progress){progress.style.animation='none';void progress.offsetWidth;progress.style.animation='';}}
sceneButtons.forEach(button=>button.addEventListener('click',()=>changeScene(Number(button.dataset.scene))));
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let sceneInView=true;
if(heroEl&&'IntersectionObserver' in window)new IntersectionObserver(entries=>{sceneInView=entries[0].isIntersecting;}).observe(heroEl);
setInterval(()=>{if(sceneImages.length<2||document.hidden||!sceneInView||motionPreference.matches||document.body.classList.contains('paused')){sceneLastChanged=Date.now();return;}if(Date.now()-sceneLastChanged>=10000)changeScene((sceneIndex+1)%sceneImages.length);},500);
