"""Build each page's own hero from hero-pages.json. --check verifies output."""
from pathlib import Path
from html import escape as e
import json,re,sys
root=Path(__file__).resolve().parents[1]
pages=json.loads((root/'hero-pages.json').read_text())
club=json.loads((root/'club-data.json').read_text())
def link(pair,css=''):
 return f'<a class="{css}" href="{e(pair[0],quote=True)}">{e(pair[1])}<span aria-hidden="true">↗</span></a>'
def photo(row):
 return f'<figure class="fcz-hero-photo"><img src="/assets/{e(row["image"])}" alt="{e(row["alt"])}" width="{row["width"]}" height="{row["height"]}" fetchpriority="high" decoding="async" style="object-position:{row["position"]}"><figcaption><span>BINNEN BIJ FCZ</span><strong>{e(row["caption"])}</strong></figcaption></figure>'
def art(row):
 kind=row['visual'];topic=e(row['topic'])
 if kind=='photo':return photo(row)
 head='<p class="fcz-art-kicker">FITNESSCENTRUM ZWANENBURG</p>'
 if kind=='calendar':
  total=sum(len(d['lessons']) for d in club['days'])
  content=f'<div class="fcz-calendar-top"><strong>{total}</strong><span>lesmomenten<br>in jouw week</span></div><div class="fcz-calendar-days">'+''.join(f'<span><b>{e(d["name"][:2])}</b><i aria-hidden="true"></i></span>' for d in club['days'])+'</div><p class="fcz-art-note">Van maandag tot en met zondag.<br>Jij kiest het moment dat past.</p>'
 elif kind=='prices':
  content='<p class="fcz-art-heading">Ruimte voor jouw ritme.</p><dl class="fcz-rate-lines"><div><dt>Maandelijks</dt><dd>€34,95 <small>/ maand</small></dd></div><div><dt>1 jaar</dt><dd>€27,50 <small>/ maand</small></dd></div><div><dt>2 jaar</dt><dd>€22,95 <small>/ maand</small></dd></div></dl><p class="fcz-art-note">Strength &amp; Conditioning: €15 extra per maand.<br>Geen inschrijfkosten.</p>'
 elif kind=='join':
  content='<p class="fcz-art-heading">Een goed begin.</p><ol class="fcz-art-steps"><li><span>01</span><strong>Gratis proberen</strong></li><li><span>02</span><strong>Voel of het past</strong></li><li><span>03</span><strong>Inschrijven in de club</strong></li></ol><p class="fcz-art-note">Geen online abonnement.<br>Wel persoonlijke aandacht.</p>'
 elif kind=='questions':
  content='<span class="fcz-question-mark" aria-hidden="true">?</span><p class="fcz-art-heading">Waar gaat jouw vraag over?</p><div class="fcz-art-links">'+link(['#faq-proeftraining','Gratis proeftraining'])+link(['#faq-inschrijven','Inschrijven in de club'])+link(['#faq-opzeggen','Je abonnement opzeggen'])+'</div>'
 elif kind=='privacy':
  content='<div class="fcz-art-symbol" aria-hidden="true"><svg viewBox="0 0 80 80" fill="none"><rect x="20" y="33" width="40" height="31" rx="5" stroke="currentColor" stroke-width="2"/><path d="M28 33V23a12 12 0 0 1 24 0v10M40 45v7" stroke="currentColor" stroke-width="2"/></svg></div><p class="fcz-art-heading">Alleen wat nodig is.</p><dl class="fcz-privacy-lines"><div><dt>Naam</dt><dd>Om je aan te spreken</dd></div><div><dt>E-mailadres</dt><dd>Voor contact over je aanvraag</dd></div><div><dt>Training</dt><dd>Om met je mee te denken</dd></div></dl>'
 elif kind=='terms':
  content='<p class="fcz-art-heading">Goed om vooraf te lezen.</p><div class="fcz-art-links">'+link(['#voorwaarden-aanmelden','01 · Aanmelden & abonnement'])+link(['#voorwaarden-veilig','02 · Veilig trainen & risico’s'])+link(['#voorwaarden-opzeggen','03 · Opzeggen & einddatum'])+'</div><p class="fcz-art-note">Overzichtelijke afspraken.<br>Ruimte voor jouw vragen.</p>'
 elif kind=='rules':
  content='<p class="fcz-art-heading">Een fijne club maken we samen.</p><ul class="fcz-art-rules"><li><span>01</span> Houd rekening met elkaar</li><li><span>02</span> Ga zorgvuldig om met materiaal</li><li><span>03</span> Volg de aanwijzingen op</li></ul><p class="fcz-art-note">Kleine afspraken.<br>Een prettige plek voor iedereen.</p>'
 elif kind=='search':
  content='<span class="fcz-search-symbol" aria-hidden="true"></span><p class="fcz-art-heading">Vind jouw volgende stap.</p><div class="fcz-art-links">'+link(['/aanbod/','Een training kiezen'])+link(['/lesrooster/','Een lesmoment vinden'])+link(['/tarieven/','Abonnementen vergelijken'])+'</div>'
 elif kind=='notfound':
  content='<strong class="fcz-error-code" aria-hidden="true">404</strong><p class="fcz-art-heading">Een andere route?</p><p class="fcz-art-note">De club is er nog.<br>We wijzen je graag de weg.</p>'
 elif kind=='catalog':
  return '<div class="fcz-hero-collage"><figure><img src="/assets/google-club-01.webp" alt="De rode fitnessruimte van FCZ" width="1920" height="1080" fetchpriority="high"><figcaption>JOUW KRACHT</figcaption></figure><figure><img src="/assets/google-club-18.webp" alt="De lichte groepsruimte van FCZ" width="1200" height="900"><figcaption>JOUW ENERGIE</figcaption></figure><div><span>FITNESS / GROEPSLESSEN / VECHTSPORT</span><strong>Vind wat jou beweegt.</strong></div></div>'
 elif kind=='address':
  return photo(row)+'<div class="fcz-hero-address"><span>JE BENT WELKOM</span><strong>Domineeslaan 87-A</strong><p>1161 BW Zwanenburg</p></div>'
 else:raise ValueError(kind)
 return f'<div class="fcz-hero-art fcz-hero-art--{kind}">{head}{content}<span class="fcz-art-corner" aria-hidden="true">↗</span></div>'
for path,row in pages.items():
 p=root/path;source=p.read_text();identifier=e(row['id'],quote=True)
 breadcrumbs=f'<nav class="fcz-hero-breadcrumbs" aria-label="Broodkruimelpad"><a href="/">Home</a><span aria-hidden="true">/</span><span>{e(row["topic"])}</span></nav>'
 if path.startswith('aanbod/') and path!='aanbod/index.html':breadcrumbs=f'<nav class="fcz-hero-breadcrumbs" aria-label="Broodkruimelpad"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/aanbod/">Aanbod</a><span aria-hidden="true">/</span><span>{e(row["topic"])}</span></nav>'
 heading=e(row['line'])+'<br><em>'+e(row['accent'])+'</em>'
 tags='<ul class="fcz-hero-tags">'+''.join('<li>'+e(t)+'</li>' for t in row['tags'])+'</ul>'
 rendered=f'<section class="fcz-hero fcz-hero--{row["mood"]} fcz-hero-topic--{row["visual"]}" data-hero="{identifier}" aria-labelledby="fcz-page-title">{breadcrumbs}<div class="fcz-hero-copy"><p class="fcz-hero-eyebrow">{e(row["topic"])}</p><h1 id="fcz-page-title">{heading}</h1><p class="fcz-hero-intro">{e(row["intro"])}</p><div class="fcz-hero-actions">{link(row["primary"],"button")}{link(row["secondary"],"fcz-hero-secondary")}</div>{tags}</div><div class="fcz-hero-visual">{art(row)}</div><div class="fcz-hero-bottom"><span>{e(row["category"])}</span><span>FCZ / {row["number"]}</span></div></section>'
 a=source.index('<main');m=re.search(r'<section\b.*?</section>',source[a:],re.S);start=a+m.start();end=a+m.end();new=source[:start]+rendered+source[end:]
 if '/heroes.css?v=1' not in new:new=new.replace('</head>','<link rel="stylesheet" href="/heroes.css?v=1"></head>')
 if '--check' in sys.argv:assert new==source,path+': run python3 tests/sync-heroes.py'
 else:p.write_text(new)
assert len({(r['line'],r['accent']) for r in pages.values()})==len(pages),'Headlines must be unique'
print(str(len(pages))+' unieke heroes gecontroleerd.' if '--check' in sys.argv else str(len(pages))+' unieke heroes opgebouwd.')
