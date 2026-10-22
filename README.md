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
- Actuele prijzen, totale kosten, looptijden, verlenging en definitieve voorwaarden. De geïmporteerde voorbeeldtarieven zijn nog als zodanig gemarkeerd; ook het aanbod met 24 maanden vraagt controle op de wettelijke voorwaarden.
- Eén gratis proeftraining naar keuze als bevestigd beleid; jeugdgroepen en afzonderlijke diensten.
- Actueel lesrooster en openingstijden; bestaande brondata is van 9 september 2026.
- Toestemming/gebruiksrechten voor aangeleverde foto's en reviewfragmenten.
- Maildienst, verwerkingsovereenkomsten, mailbox-/log-/back-upbewaarbeleid. De nieuwe privacytekst is nog een concept.
- Definitief domein, HTTPS, www, canonicals, mobiele browsers en echte formulierontvangst. Noindex blijft actief voor de testversie; verwijder het pas bij goedgekeurde livegang.

Er zijn geen DNS-, domein- of zakelijke e-mailinstellingen gewijzigd. Deze repository is nog niet door ons aan een Hostinger-website gekoppeld.

## Checks

`python3 tests/check-site.py`, `node --check trial.js`, PHP-syntaxcontrole en `php tests/trial.php`. Er is geen PHP-runtime in de lokale werkruimte; GitHub Actions voert PHP-controles uit. Live-mailtest en visuele iPhone/Safari-controle moeten nog volgen. Het beschikbare lokale previewplatform was niet beschikbaar, dus browser-QA is niet als geslaagd aangemerkt.
