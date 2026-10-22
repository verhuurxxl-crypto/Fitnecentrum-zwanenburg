"""Render the structured terms document; --check detects outdated HTML."""
from pathlib import Path
from html import escape as e
import re,json,sys
root=Path(__file__).resolve().parents[1];data=json.loads((root/'terms-content.json').read_text())
summary='''<section class="terms-overview" id="pagina-inhoud" aria-labelledby="terms-overview-title"><div class="terms-overview-heading"><p class="eyebrow">DUIDELIJK VOORAF</p><h2 id="terms-overview-title">Zo houden we het<br>prettig en helder.</h2><p>Hieronder staan de volledige conceptafspraken. Deze drie onderwerpen helpen je snel op weg.</p></div><div class="terms-summary-cards"><a href="#voorwaarden-aanmelden"><span>01 / AANMELDEN</span><h3>Persoonlijk in de club.</h3><p>Je kiest pas als het abonnement, de kosten en de looptijd duidelijk zijn.</p><b aria-hidden="true">↗</b></a><a href="#voorwaarden-veilig"><span>02 / VEILIG TRAINEN</span><h3>Jouw verantwoordelijkheid.</h3><p>Train passend bij je ervaring, gebruik materiaal zorgvuldig en volg aanwijzingen op.</p><b aria-hidden="true">↗</b></a><a href="#voorwaarden-opzeggen"><span>03 / OPZEGGEN</span><h3>Een heldere einddatum.</h3><p>We helpen je graag bij de balie en nemen de afspraken met je door.</p><b aria-hidden="true">↗</b></a></div></section>'''
nav='<aside class="terms-sidebar"><details class="terms-toc" open><summary>Op deze pagina</summary><nav aria-label="Inhoud algemene voorwaarden">'
for title,id in [('Aanmelden & lidmaatschap','aanmelden'),('Tarieven & betalen','tarieven'),('Looptijd & opzeggen','opzeggen'),('Eigen verantwoordelijkheid','veilig'),('Aansprakelijkheid & spullen','aansprakelijkheid'),('Gedrag & huisregels','gedrag'),('Wijzigingen & klachten','klachten')]:nav+=f'<a href="#voorwaarden-{id}">{e(title)} <span aria-hidden="true">↗</span></a>'
nav+='</nav></details><a class="terms-print" href="/contact/">Vragen? Kom langs bij de balie ↗</a><button class="terms-print" type="button" id="print-terms">Afdrukken / bewaren ↓</button><p class="terms-version">Conceptversie<br>'+e(data['version'])+'</p></aside>'
body='<div class="terms-article"><p class="terms-print-title">Algemene voorwaarden · Fitnesscentrum Zwanenburg · Concept</p><div class="terms-status" role="note"><strong>'+e(data['status'])+'</strong><p>'+e(data['intro'])+'</p></div>'
for i,s in enumerate(data['sections'],1):
 body+=f'<section class="terms-section" id="{s["id"]}" aria-labelledby="{s["id"]}-title"><p class="terms-section-number">ARTIKEL {i:02d}</p><h2 id="{s["id"]}-title">{e(s["title"])}</h2>'
 for text in s['paragraphs']:body+='<p>'+e(text)+'</p>'
 if s['id']=='voorwaarden-aanmelden':body+='<div class="terms-callout"><strong>Je meldt je aan bij de balie.</strong><p>Een proeflesaanvraag is geen lidmaatschap en geen betaalopdracht. We nemen de overeenkomst persoonlijk met je door.</p><a href="/inschrijven/">Zo word je lid ↗</a></div>'
 if s['id']=='voorwaarden-opzeggen':body+='<div class="terms-callout"><strong>We helpen je graag persoonlijk.</strong><p>Kom langs, dan bespreken we de einddatum en bevestiging. Schriftelijke opzegging en andere wettelijke opzegmogelijkheden blijven beschikbaar.</p><a href="/opzeggen/">Bekijk de opzegpagina ↗</a></div>'
 if s['id']=='voorwaarden-veilig':body+='<div class="terms-callout terms-callout--dark"><span>TRAIN BEWUST</span><strong>Sporten brengt risico’s mee.<br>Neem je eigen rol serieus.</strong><ul><li>Kies oefeningen en belasting passend bij je vaardigheden.</li><li>Vraag uitleg als je niet weet hoe iets werkt.</li><li>Volg redelijke veiligheidsaanwijzingen op.</li><li>Gebruik apparatuur zorgvuldig en meld onveilige situaties.</li><li>Respecteer anderen en de grenzen van veilig trainen.</li></ul><p>Dit is geen afstand van wettelijke rechten en geen uitsluiting van de wettelijke zorgplicht van de club.</p></div>'
 if s['id']=='voorwaarden-gedrag':body+='<a class="terms-inline-link" href="/huisregels/">Lees ook de huisregels ↗</a>'
 if s['id']=='voorwaarden-privacy':body+='<a class="terms-inline-link" href="/privacy/">Lees de privacyverklaring ↗</a>'
 body+='</section>'
body+='</div>'
closing='<section class="terms-close"><div><p class="eyebrow">LIEVER PERSOONLIJK?</p><h2>We nemen het graag<br>met je door.</h2><p>Vraag bij de balie naar de afspraken die horen bij jouw abonnement.</p></div><a class="button" href="/contact/">Adres &amp; openingstijden ↗</a></section>'
rendered='<!-- terms-content:start -->'+summary+'<div class="terms-layout">'+nav+body+'</div>'+closing+'<!-- terms-content:end -->'
p=root/'voorwaarden/index.html';old=p.read_text()
if '<!-- terms-content:start -->' in old:new=re.sub(r'<!-- terms-content:start -->.*?<!-- terms-content:end -->',rendered,old,flags=re.S)
else:
 a=old.index('<main');hero=re.search(r'<section\b.*?</section>',old[a:],re.S);end=a+hero.end();b=old.index('</main>',end);new=old[:end]+rendered+old[b:]
if '/voorwaarden.css?v=1' not in new:new=new.replace('</head>','<link rel="stylesheet" href="/voorwaarden.css?v=1"><script src="/voorwaarden.js?v=1" defer></script></head>')
if '--check' in sys.argv:assert new==old,'Run python3 tests/sync-terms.py'
else:p.write_text(new)
print('18 artikelen, inhoudsnavigatie en kaders gecontroleerd.' if '--check' in sys.argv else 'Voorwaardenpagina opgebouwd met 18 artikelen.')
