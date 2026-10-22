from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re,json
root=Path(__file__).resolve().parents[1]
errors=[]
class Page(HTMLParser):
 def __init__(self): super().__init__();self.links=[];self.h1=0;self.forms=[];self.inputs=[];self.ids=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='h1':self.h1+=1
  if 'id' in d:self.ids.append(d['id'])
  if tag=='form':self.forms.append(d)
  if tag in ['input','select']:self.inputs.append(d)
  if tag in ['a','link','script','img','form']:
   for key in ['href','src','action']:
    if key in d:self.links.append(d[key])
pages=list(root.rglob('*.html'))
for file in pages:
 p=Page();source=file.read_text();p.feed(source)
 if p.h1!=1:errors.append(f'{file.relative_to(root)}: {p.h1} H1-koppen')
 if len(p.ids)!=len(set(p.ids)):errors.append(f'{file.relative_to(root)}: dubbele IDs')
 if '/email/' not in str(file) and re.search(r'demo-vooraanmelding|registration-form|voorbeeldbevestiging|Start je vooraanmelding',source):errors.append(f'{file.relative_to(root)}: oude inschrijfroute')
 for link in p.links:
  u=urlsplit(link)
  if u.scheme or u.netloc or not u.path:continue
  target=root/unquote(u.path).lstrip('/') if u.path.startswith('/') else file.parent/unquote(u.path)
  if target.is_dir():target=target/'index.html'
  if not target.exists():errors.append(f'{file.relative_to(root)}: ontbreekt {link}')
trial=Page();trial.feed((root/'gratis-proefles/index.html').read_text())
fields={x['name'] for x in trial.inputs if 'name' in x and x['name']!='q'}
if fields!={'name','email','interest','website'}:errors.append(f'Onverwachte proeflesvelden: {fields}')
signup=Page();signup.feed((root/'inschrijven/index.html').read_text())
if any(x.get('id')=='registration-form' for x in signup.forms):errors.append('Lidmaatschapsformulier bestaat nog')
interests=json.loads((root/'api/interests.json').read_text())
for key in interests:
 if key!='ontdekken':
  text=(root/f'aanbod/{key}/index.html').read_text()
  if f'/gratis-proefles/?interest={key}' not in text:errors.append(f'{key}: voorkeur gaat niet mee')
club=json.loads((root/'club-data.json').read_text())
if [len(day['lessons']) for day in club['days']] != [10,5,10,7,3,1,1]:errors.append('Rooster wijkt af van de 37 gecontroleerde lesmomenten')
for day in club['days']:
 for lesson in day['lessons']:
  if lesson['interest'] not in interests:errors.append('Onbekende proeflesvoorkeur: '+lesson['interest'])
  if lesson['start']>=lesson['end']:errors.append('Onjuiste lestijd: '+str(lesson))
  if lesson['category'] not in ['jeugd','groep','kick']:errors.append('Onbekend lesfilter')
heroes=json.loads((root/'hero-pages.json').read_text())
if len(heroes)!=48:errors.append('Niet alle binnenpagina’s hebben een eigen hero')
if len({(h['line'],h['accent']) for h in heroes.values()})!=48:errors.append('Dubbele hero-kop')
for path,hero in heroes.items():
 page=Page();source=(root/path).read_text();page.feed(source)
 if f'data-hero="{hero["id"]}"' not in source:errors.append(path+': eigen hero ontbreekt')
 fragment=re.search(r'<section class="fcz-hero.*?</section>',source,re.S).group()
 parser=Page();parser.feed(fragment)
 for link in parser.links:
  url=urlsplit(link)
  if url.path=='' and url.fragment and unquote(url.fragment) not in page.ids:errors.append(path+': hero verwijst naar ontbrekend anker '+link)
  if url.path=='/gratis-proefles/' and url.query:
   from urllib.parse import parse_qs
   if parse_qs(url.query).get('interest',[''])[0] not in interests:errors.append(path+': ongeldige trainingsvoorkeur')
if errors:raise SystemExit('\n'.join(errors))
print(f'{len(pages)} HTML-pagina’s, interne bestanden, proeflesvelden en {len(interests)-1} trainingsvoorkeuren gecontroleerd.')
