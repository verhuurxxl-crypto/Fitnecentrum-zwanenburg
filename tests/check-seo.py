"""Validate unique metadata, canonical routes, JSON-LD and crawlable internal anchors."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
from collections import Counter
import json,re,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
base='https://fitnesscentrumzwanenburg.nl'
class Head(HTMLParser):
 def __init__(self):super().__init__();self.meta={};self.canon=[];self.ids=set();self.links=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.meta[a.get('name',a.get('property',''))]=a.get('content','')
  if tag=='link' and a.get('rel')=='canonical':self.canon.append(a.get('href'))
  if 'id' in a:self.ids.add(a['id'])
  if tag=='a':self.links.append(a.get('href',''))
pages={p:Head() for p in root.rglob('*.html') if not set(p.parts)&{'email','node_modules','test-results'}}
titles=[];descriptions=[];urls=[]
for p,h in pages.items():
 s=p.read_text();h.feed(s)
 title=re.search(r'<title>(.*?)</title>',s,re.S).group(1);titles.append(title)
 description=h.meta.get('description','');descriptions.append(description)
 assert title and description,p
 assert len(h.canon)==1,p
 route='/' if p==root/'index.html' else '/'+p.relative_to(root).as_posix().replace('index.html','')
 assert h.canon==[base+route],(p,h.canon,route)
 urls+=h.canon
 assert h.meta.get('og:title')==title.replace('&amp;','&'),p
 assert h.meta.get('og:description')==description,p
 assert h.meta.get('og:url')==h.canon[0],p
 assert h.meta.get('og:image','').startswith(base+'/assets/'),p
 assert h.meta.get('robots')=='noindex,nofollow',p
 for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S):json.loads(raw)
 assert len(re.findall(r'<h1\b',s))==1,p
for p,h in pages.items():
 for link in h.links:
  u=urlsplit(link)
  if u.scheme or u.netloc or not u.fragment:continue
  target=root/u.path.lstrip('/') if u.path.startswith('/') else p.parent/u.path
  if not u.path:target=p
  elif target.is_dir():target=target/'index.html'
  if target in pages:assert unquote(u.fragment) in pages[target].ids,(p,link)
assert all(v==1 for v in Counter(titles).values()),'Dubbele titels'
assert all(v==1 for v in Counter(descriptions).values()),'Dubbele omschrijvingen'
sitemap=ET.parse(root/'sitemap.xml');locations={e.text for e in sitemap.iter() if e.tag.endswith('}loc')}
expected={u for u in urls if not u.endswith(('/404.html','/zoeken/'))}
assert locations==expected,('Sitemap ontbreekt',expected-locations,'Onbekend',locations-expected)
assert 'Disallow: /' in (root/'robots.txt').read_text()
print(f'{len(pages)} unieke SEO-profielen, canonicals, JSON-LD, sitemap en interne ankers gecontroleerd. Demo blijft noindex.')
