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
if errors:raise SystemExit('\n'.join(errors))
print(f'{len(pages)} HTML-pagina’s, interne bestanden, proeflesvelden en {len(interests)-1} trainingsvoorkeuren gecontroleerd.')
