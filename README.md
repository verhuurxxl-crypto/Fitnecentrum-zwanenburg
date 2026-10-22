# Fitnesscentrum Zwanenburg

HTML/CSS/JavaScript-site voor Hostinger PHP-webhosting. Gebaseerd op de door de eigenaar aangeleverde ZIP. De originele ZIP blijft als back-up in Git; de losse bestanden zijn de bewerkbare website.

De hoofdactie is één gratis proeftraining naar keuze. De bezoeker vult naam, e-mail en gewenste training in. De club stemt het moment daarna af. Er is geen online abonnementsinschrijving. `/inschrijven/` legt uit hoe persoonlijk lid worden werkt. `/voorwaarden/` bevat een herkenbaar concept dat eerst door de eigenaar moet worden vastgesteld.

## Bekijken en plaatsen

Gebruik een eigen testdomein/subdomein bij Hostinger. Upload de inhoud van de actuele release-ZIP rechtstreeks in `public_html`, met `index.html` bovenaan. Of koppel deze repository op branch `main` via Hostinger Git. Er is geen build nodig. Kopieer geen originele import-ZIP naar de webmap. De bestaande demo- en plintenrepositories zijn niet gewijzigd.

De GitHub-workflow controleert HTML, JavaScript en PHP, test validatie/mailinhoud zonder echte verzending, en maakt na geslaagde checks `release/fitnesscentrum-zwanenburg-hostinger.zip`. GitHub → Actions toont de resultaten. De release-ZIP bevat alleen de websitebestanden, geen tests, workflowbestanden of oude ZIP.

## E-mail activeren — nog te doen

Online aanvragen zijn standaard UIT. De pagina verwijst naar de telefoon zolang `/api/trial.php` geen geconfigureerde mailroute meldt. Er is geen demo-success, ongemerkt opgeslagen aanvraag of `mail()`-fallback.

1. Laat de eigenaar de ontvangende clubmailbox, afzender en privacygegevens bevestigen. Zet geen wachtwoorden in Git of chat.
2. Gebruik PHP 8.1+ met PDO SQLite en OpenSSL. Maak BUITEN `public_html` de private map `fcz-config` met toegang alleen voor het hostingaccount.
3. Kopieer `config/mail.example.php` naar `fcz-config/trial.php`; vul daar de geauthenticeerde SMTP-instellingen, afzender, ontvanger en een willekeurig geheim van minstens 32 tekens in. Pas SMTP-host/poort en TLS-modus aan de bevestigde maildienst aan. Stel bestandsrechten passend in, bij voorkeur 600 voor de config en database. De map mag niet via een websitealias bereikbaar zijn.
4. Stel `enabled` pas in op `true` na controle van deze gegevens. De module maakt `fcz-config/trial.sqlite` aan en bewaart aanvragen, verzendstatus en een gepseudonimiseerd spamkenmerk maximaal 90 dagen.
5. Verstuur met toestemming een echte gecontroleerde proefaanvraag. Controleer clubmail én klantmail, afzender, spammap en antwoorden. Dit is nog niet uitgevoerd; er zijn geen inloggegevens beschikbaar. Test ook een ongeldig adres en een dubbelklik. Zet bij problemen `enabled` terug op `false`.
6. Bij onzekere SMTP-uitkomst nooit blind opnieuw versturen. Controleer mailbox en private database aan de hand van de aanvraag-ID in het serverlog. Mail kan al geaccepteerd zijn terwijl de verbinding uitviel. Er is geen automatisch herstel of beheerinterface voor zulke uitzonderingen; kantoor handelt dit handmatig af.

`office_sent` en `customer_sent` betekenen acceptatie door de SMTP-server, geen bewijs van inboxaflevering. De bezoeker krijgt bij mislukte clubverzending een foutmelding. Als alleen de klantmail mislukt, bevestigt de pagina de ontvangen aanvraag en noemt zij expliciet dat de bevestigingsmail niet is verstuurd. Dubbel verzenden met dezelfde aanvraagsleutel maakt geen nieuwe mail. Veranderde gegevens bij dezelfde sleutel geven een conflict. Maximaal vijf pogingen per uur per gepseudonimiseerd IP-kenmerk. Alleen de webserver-IP (`REMOTE_ADDR`) wordt gebruikt; controleer rate-limiting achter eventuele proxies.

De privacypagina noemt dat voor de clubmailbox zelf ook verwijdering na 90 dagen moet worden ingericht. De eigenaar stelt daarnaast de bewaartermijnen voor hostinglogboeken en back-ups vast. Maak consistente back-ups van de private SQLite-database en configuratie en beperk wie die kan lezen. Deel geen aanvraaggegevens in Git.

## Mailontwerp

`email/welkom.html` is het gebruikte HTML-mailsjabloon; alle ingevulde bezoekersgegevens worden ge-escaped. `email/voorbeeld.html` toont dezelfde mail met fictieve gegevens. Er is geen mail verzonden door het bekijken van het voorbeeld.

## Inhoud vóór livegang bevestigen

- Juridische bedrijfsnaam, KvK en zakelijk/privacy-e-mailadres.
- Actuele prijzen, totale kosten, looptijden, verlenging en definitieve voorwaarden. De prijzen zijn bijgewerkt zoals hieronder beschreven; het aanbod met 24 maanden vraagt controle op de wettelijke voorwaarden.
- Eén gratis proeftraining naar keuze als bevestigd beleid; jeugdgroepen en afzonderlijke diensten.
- Actueel lesrooster en openingstijden; rooster is op 22 oktober 2026 overgenomen van de oude website.
- Toestemming/gebruiksrechten voor aangeleverde foto's en reviewfragmenten.
- Maildienst, verwerkingsovereenkomsten, mailbox-/log-/back-upbewaarbeleid. De nieuwe privacytekst is nog een concept.
- Definitief domein, HTTPS, www, canonicals, mobiele browsers en echte formulierontvangst. Noindex blijft actief voor de testversie; verwijder het pas bij goedgekeurde livegang.

Er zijn geen DNS-, domein- of zakelijke e-mailinstellingen gewijzigd. De opdrachtgever heeft de repository aan de Hostinger-demo gekoppeld; wijzigingen op main zijn eerder zichtbaar geverifieerd op demo.onlinebeheer.me.

## Checks

`python3 tests/check-site.py`, `node --check trial.js`, PHP-syntaxcontrole en `php tests/trial.php`. Er is geen PHP-runtime in de lokale werkruimte; GitHub Actions voert PHP-controles uit. Live-mailtest en controle op een echte iPhone moeten nog volgen. Chromium- en WebKit-browserchecks worden in GitHub Actions uitgevoerd.

## Afwerking 22 oktober 2026

Nieuwe praktische pagina voor persoonlijk inschrijven en opzeggen, veelgestelde vragen, duidelijke footer en bijgewerkte trainingsintro’s. Een schriftelijke opzegroute blijft beschikbaar. Het formulier toont zolang de mailroute uit staat een duidelijke belknop in plaats van invulvelden met een onbruikbare verzendknop.

De oude clubwebsite noemt op verschillende pagina’s €72,50 en €72,90 voor een gezin, en spreekt zichzelf tegen over €15 inschrijfkosten of terugbetaalbare pasborg. Deze gegevens zijn daarom niet als definitieve nieuwe afspraken vastgesteld. Laat de eigenaar dit bevestigen.

Aanvullende CI: vier mobiele breedtes (320/375/390/430) en desktop in Chromium en WebKit, menu openen/sluiten/scrollherstel, ontbrekende bestanden en frontendfouten/herhalen met een uitsluitend lokaal onderschept mailtransport. Screenshots en resultaten staan bij de GitHub Actions-run. Dit vervangt geen echte iPhone-test of gecontroleerde inboxontvangst.

## Prijzen en activiteiten — 22 oktober 2026

Alle 37 lesmomenten uit https://fitnesscentrumzwanenburg.nl/les-rooster/ overgenomen, inclusief gelijktijdige lessen en weekend. Geen zaalnamen toegevoegd: die vermeldt deze bron niet. Niet-bevestigde donderdagles Buikspierkwartier verwijderd uit het rooster. Activiteiten zonder gepubliceerd tijdstip blijven in het aanbod, zonder verzonnen lesmomenten.

Opdrachtgever bevestigde in deze sessie €72,50 per maand voor gezinnen en geen inschrijfkosten. Geen pasborgbedrag gepubliceerd: het antwoord was “geen”. De drie basistarieven (€34,95 / €27,50 / €22,95) zijn behouden. Strength & Conditioning: €15 toeslag of €35 uitsluitend S&C; 10-rittenkaart €65; jeugd €15. Bron: oude tarievenpagina. Inschrijven gebeurt in de club. Schriftelijk opzeggen blijft mogelijk.

Bewerk aanvullende prijzen en rooster in `club-data.json` en voer `python3 tests/sync-club.py` uit. Dit werkt de statische HTML op homepage, tarievenpagina en lesrooster bij. CI voorkomt dat deze kopieën uiteenlopen. Het volledige weekrooster werkt ook zonder JavaScript; JavaScript voegt filters per dag en training toe. Elke les verwijst naar de bijbehorende geldige proeflesvoorkeur. Geen aanmelding of beschikbaarheidsreservering via het rooster.

Testuitbreiding: 12 routes in Chromium/WebKit op vier mobiele breedtes en desktop, zeven dagen, alle filters, lege selectie en herstel, prijzen en weekrooster zonder JavaScript. E-mailconfiguratie en gecontroleerde inboxontvangst blijven open.


## Vriendelijke opzegpagina — 22 oktober 2026

`/opzeggen/` legt de persoonlijke voorkeursroute uit, met drie stappen, praktische informatie en veelgestelde vragen. Alle footerlinks en bestaande opzegverwijzingen leiden naar deze pagina. Er is geen opzegformulier of automatische verwerking. Geen druk om een reden te geven en geen verzonnen bewaartermijnen of opzegdeadlines. De pagina sluit schriftelijke opzegging of de oorspronkelijke afsluitwijze niet uit: zie ACM, https://www.acm.nl/nl/verkoop-aan-consumenten/klantenservice/annuleren-en-opzeggen. Persoonlijke aanwezigheid, een ledenpas en ontvangst van een bevestiging zijn niet voorgesteld als geldigheidsvoorwaarde.


## Individuele heroes en gestructureerde voorwaarden — 22 oktober 2026

Alle 48 binnenpagina’s hebben een eigen hero, naast de aparte fotografiehero van de homepage. Tekst, beeldkeuze, thema en links staan in `hero-pages.json`; `python3 tests/sync-heroes.py` werkt de statische HTML bij. De foto’s zijn bestaande clubassets met concrete alt-tekst; geen gefingeerde trainingfoto’s of verzonnen teams. Praktische pagina’s hebben onderwerpspecifieke informatieblokken. De hero-link van elke training geeft een geldige, exacte proeflesvoorkeur door.

`terms-content.json` bevat 18 artikelen. `python3 tests/sync-terms.py` genereert de inhoud, kaders en inhoudsopgave van de voorwaardenpagina. De afdrukfunctie gebruikt de printdialoog van de bezoeker. Dit is uitdrukkelijk een nieuwe concepttekst, geen automatische wijziging van bestaande ledencontracten. Nog vast te stellen: juridische contractspartij, KvK, zakelijk contactadres, juridische beoordeling van 24 maanden en definitieve afspraken. Er is geen volledige aansprakelijkheidsuitsluiting, onbevestigde verzekeringslimiet of beperking van wettelijke opzegrechten geïntroduceerd. Bronnen voor controle: ACM algemene voorwaarden, ACM annuleren en opzeggen, Rijksoverheid regels incassokosten.

De CI-controle bezoekt alle 49 routes in Chromium en WebKit op 320/375/390/430/1366 pixels, controleert alle hero-afbeeldingen en genereert screenshots van negen representatieve heroes. Daarnaast blijven de bestaande menu-, footer-, rooster-, voorkeur- en mailtests actief.
