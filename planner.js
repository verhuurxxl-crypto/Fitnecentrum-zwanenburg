import {calculateRhythm} from './rhythm-math.js';
const frequency=document.querySelector('#frequency');
const gauge=document.querySelector('#rhythm-gauge');
let duration=45;
function changeNumber(selector,value){const el=document.querySelector(selector);if(el.textContent===String(value))return;el.textContent=value;el.classList.remove('number-change');void el.offsetWidth;el.classList.add('number-change');}
function updateRhythm(){const result=calculateRhythm(frequency.value,duration);document.querySelector('#frequency-label').textContent=result.frequency+' keer';frequency.setAttribute('aria-valuetext',result.frequency+' trainingen per week');frequency.style.setProperty('--range-fill',(result.frequency-1)/4*100+'%');gauge.style.setProperty('--gauge-angle',result.angle+'deg');gauge.setAttribute('aria-label',result.frequency+' trainingen per week van '+duration+' minuten');changeNumber('#gauge-number',result.frequency);changeNumber('#weekly-minutes',result.weeklyMinutes);changeNumber('#four-week-sessions',result.fourWeekSessions);document.querySelector('#session-formula').textContent=result.frequency+' × '+duration+' min';document.querySelectorAll('.week-day').forEach((day,index)=>{const active=result.days.includes(index);day.classList.toggle('training-day',active);day.style.setProperty('--bar-fill',active?duration/60*100+'%':'0%');});}
frequency.addEventListener('input',updateRhythm);
document.querySelectorAll('[data-duration]').forEach(button=>button.addEventListener('click',()=>{duration=Number(button.dataset.duration);document.querySelectorAll('[data-duration]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});updateRhythm();}));
updateRhythm();
