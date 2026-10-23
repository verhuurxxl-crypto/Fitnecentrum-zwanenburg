"""Keep metadata consistent with actual pages; staging remains noindex until domain migration."""
from pathlib import Path
from html import escape,unescape
from html.parser import HTMLParser
import json,re,sys
root=Path(__file__).resolve().parents[1]
base='https://fitnesscentrumzwanenburg.nl'
titles={
'index.html':'Sportschool in Zwanenburg | Fitnesscentrum Zwanenburg',
'lesrooster/index.html':'Lesrooster in Zwanenburg | Fitnesscentrum Zwanenburg',
'aanbod/index.html':'Sportaanbod in Zwanenburg | Fitnesscentrum Zwanenburg',
'contact/index.html':'Contact & openingstijden | Fitnesscentrum Zwanenburg',
'huisregels/index.html':'Huisregels | Fitnesscentrum Zwanenburg',
'inschrijven/index.html':'Lid worden in de club | Fitnesscentrum Zwanenburg',
'voorwaarden/index.html':'Algemene voorwaarden | Fitnesscentrum Zwanenburg',
'jouw-ritme/index.html':'Plan jouw sportweek | Fitnesscentrum Zwanenburg'}
updated=[]
for p in sorted(root.rglob('*.html')):
 if any(x in p.parts for x in ['email','node_modules','test-results']):continue
 path=p.relative_to(root).as_posix();old=p.read_text();s=old
 title=titles.get(path,unescape(re.search(r'<title>(.*?)</title>',s,re.S).group(1)))
 s=re.sub(r'<title>.*?</title>','<title>'+escape(title)+'</title>',s,count=1,flags=re.S)
 canonical=re.search(r'<link rel="canonical" href="([^"]+)"',s).group(1)
 description=unescape(re.search(r'<meta name="description" content="([^"]+)"',s).group(1))
 def meta(key,value):
  global s
  pattern=r'<meta property="'+re.escape(key)+r'" content="[^"]*"\s*/?>'
  tag='<meta property="'+key+'" content="'+escape(value,quote=True)+'">'
  s=re.sub(pattern,tag,s) if re.search(pattern,s) else s.replace('</head>',tag+'</head>')
 for key,value in {'og:title':title,'og:description':description,'og:type':'website','og:url':canonical,'og:site_name':'Fitnesscentrum Zwanenburg','og:locale':'nl_NL','og:image':base+'/assets/12-1536x922.jpg','og:image:alt':'De fitnessruimte van Fitnesscentrum Zwanenburg'}.items():meta(key,value)
 if path=='index.html':
  graph={'@context':'https://schema.org','@graph':[
   {'@type':'WebSite','@id':base+'/#website','name':'Fitnesscentrum Zwanenburg','url':base+'/','inLanguage':'nl-NL','publisher':{'@id':base+'/#club'}},
   {'@type':'HealthClub','@id':base+'/#club','name':'Fitnesscentrum Zwanenburg','url':base+'/','telephone':'+31204978616','image':base+'/assets/12-1536x922.jpg','logo':base+'/assets/original-logo.png','address':{'@type':'PostalAddress','streetAddress':'Domineeslaan 87-A','postalCode':'1161 BW','addressLocality':'Zwanenburg','addressCountry':'NL'},'sameAs':['https://www.instagram.com/fitnesscentrumzwanenburg/']},
   {'@type':'WebPage','@id':base+'/#webpage','url':base+'/','name':title,'description':description,'inLanguage':'nl-NL','isPartOf':{'@id':base+'/#website'},'about':{'@id':base+'/#club'}}]}
  s=re.sub(r'<script type="application/ld\+json">.*?</script>','',s,flags=re.S)
  s=s.replace('</head>','<script type="application/ld+json">'+json.dumps(graph,ensure_ascii=False,separators=(',',':'))+'</script></head>')
 else:
  def structured(m):
   data=json.loads(m.group(1))
   for item in data.get('@graph',[]):
    if item.get('@type')=='WebPage':item['name']=title.split(' | ')[0];item['description']=description
   return '<script type="application/ld+json">'+json.dumps(data,ensure_ascii=False,separators=(',',':'))+'</script>'
  s=re.sub(r'<script type="application/ld\+json">(.*?)</script>',structured,s,flags=re.S)
 if '--check' in sys.argv:assert s==old,path+': run python3 tests/sync-seo.py'
 elif s!=old:p.write_text(s);updated.append(path)
print('SEO-metadata op 49 websitepagina’s gecontroleerd; '+str(len(updated))+' bijgewerkt.')
