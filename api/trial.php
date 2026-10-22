<?php
declare(strict_types=1);
require __DIR__.'/trial-lib.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function reply(int $status, array $data): never { http_response_code($status); echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES); exit; }
$config=fcz_config();
$method=$_SERVER['REQUEST_METHOD']??'';
if ($method==='GET') reply(200,['available'=>fcz_ready($config)]);
if ($method!=='POST') { header('Allow: GET, POST'); reply(405,['error'=>'Deze aanvraagmethode is niet beschikbaar.']); }
$host=strtolower($_SERVER['HTTP_HOST']??'');
$origin=$_SERVER['HTTP_ORIGIN']??'';
if ($origin!=='' && (strtolower(parse_url($origin,PHP_URL_HOST)??'').(parse_url($origin,PHP_URL_PORT)?':'.parse_url($origin,PHP_URL_PORT):''))!==$host) reply(403,['error'=>'Open het formulier op onze website en probeer opnieuw.']);
if (($_SERVER['HTTP_SEC_FETCH_SITE']??'')==='cross-site') reply(403,['error'=>'Open het formulier op onze website en probeer opnieuw.']);
if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE']??''),'application/json')) reply(415,['error'=>'Gebruik het proeflesformulier op de website.']);
if (!fcz_ready($config)) reply(503,['error'=>'Online aanvragen is binnenkort beschikbaar. Bel 020 497 8616 om je gratis proeftraining af te spreken.']);
$raw=file_get_contents('php://input',false,null,0,8193);
if (strlen($raw)>8192) reply(413,['error'=>'De aanvraag is te groot.']);
try { $payload=json_decode($raw,true,16,JSON_THROW_ON_ERROR); if (!is_array($payload)) throw new InvalidArgumentException('Controleer je gegevens.'); $p=fcz_validate($payload); }
catch (Throwable $e) { reply(422,['error'=>$e instanceof InvalidArgumentException?$e->getMessage():'Controleer je ingevulde gegevens.']); }
$db=null;
try {
    $private=dirname(__DIR__,2).'/fcz-config';
    $db=new PDO('sqlite:'.$private.'/trial.sqlite',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    @chmod($private.'/trial.sqlite',0600);
    $db->exec('PRAGMA busy_timeout=5000');
    $db->exec('CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, iphash TEXT NOT NULL, created INTEGER NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, interest TEXT NOT NULL, state TEXT NOT NULL, office_sent INTEGER NOT NULL DEFAULT 0, customer_sent INTEGER NOT NULL DEFAULT 0)');
    $db->prepare('DELETE FROM requests WHERE created < ?')->execute([time()-90*86400]);
    $fingerprint=hash_hmac('sha256',json_encode([$p['name'],$p['email'],$p['interest']]),$config['secret']);
    $iphash=hash_hmac('sha256',$_SERVER['REMOTE_ADDR']??'unknown',$config['secret']);
    $db->exec('BEGIN IMMEDIATE');
    $q=$db->prepare('SELECT * FROM requests WHERE id=?'); $q->execute([$p['requestId']]); $existing=$q->fetch(PDO::FETCH_ASSOC);
    if ($existing) {
        $db->exec('COMMIT');
        if (!hash_equals($existing['fingerprint'],$fingerprint)) reply(409,['error'=>'Deze aanvraag is al gebruikt met andere gegevens. Ververs de pagina voor een nieuwe aanvraag.']);
        if ($existing['office_sent']) reply(200,['accepted'=>true,'confirmationSent'=>(bool)$existing['customer_sent']]);
        reply(409,['error'=>'Je aanvraag wordt verwerkt of de verzendstatus is onzeker. Bel 020 497 8616 voordat je opnieuw aanvraagt.']);
    }
    $q=$db->prepare('SELECT COUNT(*) FROM requests WHERE iphash=? AND created>?'); $q->execute([$iphash,time()-3600]);
    if ((int)$q->fetchColumn()>=5) { $db->exec('COMMIT'); reply(429,['error'=>'Er zijn meerdere aanvragen ontvangen. Probeer later opnieuw of bel 020 497 8616.']); }
    $q=$db->prepare('INSERT INTO requests (id,fingerprint,iphash,created,name,email,interest,state) VALUES (?,?,?,?,?,?,?,?)');
    $q->execute([$p['requestId'],$fingerprint,$iphash,time(),$p['name'],$p['email'],$p['interest'],'sending']);
    $db->exec('COMMIT');
    $office='<h1>Nieuwe aanvraag gratis proeftraining</h1><p>Naam: '.htmlspecialchars($p['name'],ENT_QUOTES,'UTF-8').'</p><p>E-mail: '.htmlspecialchars($p['email'],ENT_QUOTES,'UTF-8').'</p><p>Training: '.htmlspecialchars($p['interestName'],ENT_QUOTES,'UTF-8').'</p><p>Neem per e-mail contact op om het lesmoment af te stemmen. Er is geen lidmaatschap afgesloten.</p>';
    fcz_smtp($config,$config['recipient'],'Gratis proeftraining · '.$p['interestName'],$office,$p['requestId'].'-club');
    $db->prepare('UPDATE requests SET office_sent=1 WHERE id=?')->execute([$p['requestId']]);
    try {
        fcz_smtp($config,$p['email'],'Welkom! Leuk dat je gratis wilt komen proeftrainen',fcz_welcome($p),$p['requestId'].'-welcome');
        $db->prepare('UPDATE requests SET state=?,customer_sent=1 WHERE id=?')->execute(['sent',$p['requestId']]);
        reply(200,['accepted'=>true,'confirmationSent'=>true]);
    } catch (Throwable $e) {
        $db->prepare('UPDATE requests SET state=? WHERE id=?')->execute(['customer-review',$p['requestId']]);
        error_log('FCZ trial customer email needs review: '.$p['requestId']);
        reply(202,['accepted'=>true,'confirmationSent'=>false]);
    }
} catch (Throwable $e) {
    if ($db && $db->inTransaction()) $db->rollBack();
    // A disconnected SMTP session can have delivered mail. Do not resend automatically.
    error_log('FCZ trial delivery needs review: '.$p['requestId']);
    reply(503,['error'=>'We konden de verzending niet bevestigen. Bel 020 497 8616 om je aanvraag te controleren.']);
}
