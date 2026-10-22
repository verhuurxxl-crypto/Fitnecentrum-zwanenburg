// The complete week is static HTML. JavaScript adds day and training filters.
(() => {
 const controls=document.querySelector('#schedule-controls');
 const groups=[...document.querySelectorAll('[data-schedule-day]')];
 if(!controls||!groups.length)return;
 const filter=document.querySelector('#lesson-filter');
 const buttons=[...controls.querySelectorAll('[data-day]')];
 const empty=document.querySelector('#schedule-empty');
 const status=document.querySelector('#schedule-status');
 let selected='0';
 function render(){
  let count=0;
  for(const group of groups){
   const active=selected==='all'||group.dataset.scheduleDay===selected;
   let visible=0;
   group.querySelectorAll('.lesson').forEach(lesson=>{
    lesson.hidden=filter.value!=='all'&&lesson.dataset.category!==filter.value;
    if(!lesson.hidden)visible++;
   });
   group.hidden=!active||visible===0;
   if(active)count+=visible;
  }
  buttons.forEach(button=>{
   const active=button.dataset.day===selected;
   button.classList.toggle('active',active);
   button.setAttribute('aria-pressed',String(active));
  });
  empty.hidden=count>0;
  const day=buttons.find(button=>button.dataset.day===selected).textContent;
  status.textContent=`${day}: ${count} ${count===1?'les':'lessen'}`;
 }
 buttons.forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.day;render();}));
 filter.addEventListener('change',render);
 controls.hidden=false;
 render();
})();
