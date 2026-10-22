<?php
declare(strict_types=1);
require dirname(__DIR__).'/api/trial-lib.php';
$checks=0;
function check(bool $ok,string $label): void { global $checks; $checks++; if (!$ok) throw new RuntimeException($label); }
$good=['name'=>'Robin Voorbeeld','email'=>'robin@example.com','interest'=>'yoga','website'=>'','requestId'=>'11111111-1111-4111-8111-111111111111','startedAt'=>(int)(microtime(true)*1000)-10000];
$data=fcz_validate($good);
check($data['interestName']==='Yoga','Yoga geselecteerd');
foreach ([['name'=>''],['email'=>"x@example.com\r\nBcc: x@example.com"],['email'=>'geen adres'],['interest'=>'onbekend'],['interest'=>['yoga']],['website'=>'spam'],['requestId'=>'bad'],['startedAt'=>microtime(true)*1000+10000],['name'=>"Naam\nHeader"]] as $change) {
    try { fcz_validate(array_replace($good,$change)); check(false,'Ongeldige invoer geaccepteerd'); }
    catch (InvalidArgumentException $e) { check(true,'Ongeldige invoer geweigerd'); }
}
check(!fcz_ready([]),'Geen verzending zonder configuratie');
check(!fcz_ready(['enabled'=>false]),'Uitgeschakeld blijft uit');
$welcome=fcz_welcome(array_replace($data,['name'=>'<script>alert(1)</script> & Robin']));
check(!str_contains($welcome,'<script>'),'Naam wordt veilig gecodeerd');
check(str_contains($welcome,'&lt;script&gt;'),'Naam als tekst weergegeven');
check(!str_contains($welcome,'{{'),'Alle mailvelden ingevuld');
check(str_contains($welcome,'nog niet definitief ingepland'),'Geen fictieve boeking');
check(str_contains($welcome,'geen abonnement afgesloten'),'Geen lidmaatschap via proefles');
check(str_contains($welcome,'Domineeslaan 87-A'),'Adres in welkomstmail');
echo "$checks formulier- en mailcontroles geslaagd; geen echte e-mail verstuurd.\n";
