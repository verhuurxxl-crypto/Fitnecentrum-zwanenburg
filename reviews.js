for(const section of document.querySelectorAll('.member-stories')){
 const track=section.querySelector('.review-grid'),cards=[...track.children],prev=section.querySelector('[data-review-prev]'),next=section.querySelector('[data-review-next]'),pause=section.querySelector('[data-review-pause]'),status=section.querySelector('[data-review-status]');
 if(!prev||cards.length<2)continue;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');let paused=reduced.matches,visible=false,index=0,hovered=false,lastMove=Date.now();
 function updatePause(){pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Hervat beweging ▶':'Pauzeer beweging Ⅱ'}
 function move(step){index=(index+step+cards.length)%cards.length;const left=cards[index].offsetLeft-cards[0].offsetLeft;track.scrollTo({left,behavior:reduced.matches?'instant':'smooth'});status.textContent='Ervaring '+(index+1)+' van '+cards.length;lastMove=Date.now()}
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));pause.addEventListener('click',()=>{paused=!paused;updatePause();lastMove=Date.now()});
 track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
 track.addEventListener('pointerenter',()=>hovered=true);track.addEventListener('pointerleave',()=>{hovered=false;lastMove=Date.now()});
 track.addEventListener('pointerdown',()=>{paused=true;updatePause()});
 track.addEventListener('scroll',()=>{const nearest=cards.reduce((best,card,i)=>Math.abs(card.offsetLeft-cards[0].offsetLeft-track.scrollLeft)<Math.abs(cards[best].offsetLeft-cards[0].offsetLeft-track.scrollLeft)?i:best,0);index=nearest;status.textContent='Ervaring '+(index+1)+' van '+cards.length},{passive:true});
 reduced.addEventListener('change',()=>{if(reduced.matches){paused=true;updatePause()}});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;lastMove=Date.now()},{threshold:.35}).observe(section);
 setInterval(()=>{if(!visible||paused||hovered||document.hidden||section.contains(document.activeElement)||document.body.classList.contains('paused')){lastMove=Date.now();return}if(Date.now()-lastMove>6500)move(1)},500);updatePause();
}
