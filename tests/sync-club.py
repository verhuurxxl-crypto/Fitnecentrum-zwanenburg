"""Generate accessible static prices and schedule from club-data.json.
Run with --check in CI; without arguments to update.
"""
from pathlib import Path
from html import escape as e
import json,re,sys
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'club-data.json').read_text())
prices='<div class="other-prices club-extra-prices">'
for price in data['prices']:
 prices+='<article><h3>'+e(price['name'])+'</h3>'
 if 'amount' in price:prices+='<p class="club-extra-amount">€'+e(price['amount'])+' <span>'+e(price['unit'])+'</span></p>'
 if 'detail' in price:prices+='<p>'+e(price['detail'])+'</p>'
 prices+='</article>'
prices+='</div><p class="note"><strong>Geen inschrijfkosten.</strong> Inschrijven doen we persoonlijk in de club. We bespreken vooraf je looptijd, totale kosten en opzegafspraken. Wil je opzeggen? Kom langs bij de balie; schriftelijk opzeggen is ook mogelijk.</p>'
schedule='<div id="schedule-controls" hidden><div class="schedule-filter"><label for="lesson-filter">Welke training zoek je?</label><select id="lesson-filter"><option value="all">Alle trainingen</option><option value="kick">Kickboksen &amp; zaktraining</option><option value="jeugd">Jeugdlessen</option><option value="groep">Overige groepslessen</option></select></div><div class="days" role="group" aria-label="Kies een dag">'
for i,day in enumerate(data['days']):schedule+=f'<button type="button" data-day="{i}" aria-pressed="false">{e(day["name"])}</button>'
schedule+='<button type="button" data-day="all" aria-pressed="false">Hele week</button></div><p id="schedule-status" class="note" role="status" aria-live="polite"></p></div><div id="lessons">'
for i,day in enumerate(data['days']):
 schedule+=f'<section class="schedule-day" data-schedule-day="{i}" aria-labelledby="schedule-day-{i}"><h3 id="schedule-day-{i}" class="schedule-day-heading">{e(day["name"])}</h3>'
 for lesson in day['lessons']:
  name=e(lesson['name']);interest=e(lesson['interest']);category=e(lesson['category'])
  schedule+=f'<article class="lesson" data-category="{category}"><div class="lesson-time"><time datetime="{lesson["start"]}">{lesson["start"]}</time><span aria-hidden="true"> – </span><time datetime="{lesson["end"]}">{lesson["end"]}</time></div><h4>{name}</h4><a href="/gratis-proefles/?interest={interest}" aria-label="Gratis proeftraining aanvragen voor {name}">Proefles ↗</a></article>'
 schedule+='</section>'
schedule+='</div><p id="schedule-empty" class="schedule-empty" hidden>Geen les in deze selectie. Kies een andere dag of bekijk de hele week.</p><p class="note">Dit weekrooster is overgenomen van het gepubliceerde clubrooster. Rond feestdagen en vakanties kunnen lessen afwijken. Bel vooraf voor je eerste les: <a href="tel:+31204978616">020 497 8616</a>. Een proeftraining stemmen we persoonlijk met je af.</p>'
for path,key,markup in [('index.html','prices',prices),('tarieven/index.html','prices',prices),('lesrooster/index.html','schedule',schedule)]:
 p=root/path;old=p.read_text();pattern=r'<!-- club-'+key+r':start -->.*?<!-- club-'+key+r':end -->'
 assert len(re.findall(pattern,old,re.S))==1,path+': missing/duplicate markers'
 new=re.sub(pattern,'<!-- club-'+key+':start -->'+markup+'<!-- club-'+key+':end -->',old,flags=re.S)
 if '--check' in sys.argv:assert new==old,path+': run python3 tests/sync-club.py'
 else:p.write_text(new)
print('Prijzen op 2 pagina’s en 37 lesmomenten in 7 dagen gesynchroniseerd.')
