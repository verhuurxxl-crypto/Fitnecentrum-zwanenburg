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
