<?php
declare(strict_types=1);

function fcz_config(): array {
    $path = dirname(__DIR__, 2) . '/fcz-config/trial.php';
    return is_file($path) ? (array) require $path : [];
}
function fcz_ready(array $c): bool {
    return !empty($c['enabled']) && strlen($c['secret'] ?? '') >= 32
        && filter_var($c['recipient'] ?? '', FILTER_VALIDATE_EMAIL)
        && filter_var($c['sender'] ?? '', FILTER_VALIDATE_EMAIL)
        && !empty($c['smtp_host']) && !empty($c['smtp_user']) && !empty($c['smtp_password'])
        && in_array($c['smtp_security'] ?? '', ['ssl', 'starttls'], true)
        && extension_loaded('pdo_sqlite') && extension_loaded('openssl');
}
function fcz_validate(array $p): array {
    foreach (['name', 'email', 'interest', 'requestId', 'website'] as $field) {
        if (isset($p[$field]) && !is_string($p[$field])) throw new InvalidArgumentException('Controleer je ingevulde gegevens.');
    }
    $name = trim($p['name'] ?? ''); $email = trim($p['email'] ?? ''); $interest = $p['interest'] ?? '';
    $interests = json_decode(file_get_contents(__DIR__ . '/interests.json'), true, 32, JSON_THROW_ON_ERROR);
    if ($name === '' || strlen($name) > 480 || preg_match('/[\x00-\x1F\x7F]/u', $name) || !preg_match('//u', $name)) throw new InvalidArgumentException('Vul je naam in, zonder bijzondere stuurtekens.');
    if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) throw new InvalidArgumentException('Vul een geldig e-mailadres in.');
    if (!isset($interests[$interest])) throw new InvalidArgumentException('Kies een training uit de lijst.');
    if (!preg_match('/^[a-f0-9-]{36}$/D', $p['requestId'] ?? '')) throw new InvalidArgumentException('Ververs de pagina en probeer opnieuw.');
    if (!empty($p['website'])) throw new InvalidArgumentException('Versturen lukt niet. Neem telefonisch contact op.');
    $started = $p['startedAt'] ?? null;
    if (!is_numeric($started) || $started > microtime(true)*1000-1000 || $started < microtime(true)*1000-86400000) throw new InvalidArgumentException('Neem even de tijd om je gegevens te controleren en probeer opnieuw.');
    return ['name'=>$name, 'email'=>$email, 'interest'=>$interest, 'interestName'=>$interests[$interest], 'requestId'=>$p['requestId']];
}
function fcz_welcome(array $p): string {
    return strtr(file_get_contents(dirname(__DIR__) . '/email/welkom.html'), [
        '{{name}}'=>htmlspecialchars($p['name'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        '{{interest}}'=>htmlspecialchars($p['interestName'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
    ]);
}
// Minimal encrypted SMTP transport. No mail() fallback and no credentials in public files.
function fcz_smtp(array $c, string $to, string $subject, string $body, string $messageId): void {
    foreach ([$to, $c['sender'], $c['recipient']] as $address) if (!filter_var($address, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $address)) throw new RuntimeException('Ongeldig mailadres.');
    if (!in_array($c['smtp_security'], ['ssl', 'starttls'], true)) throw new RuntimeException('TLS vereist.');
    $host=$c['smtp_host']; $port=(int)$c['smtp_port'];
    if (!preg_match('/^[a-z0-9.-]+$/iD', $host) || !in_array($port, [465,587], true)) throw new RuntimeException('Ongeldige SMTP-server.');
    $context=stream_context_create(['ssl'=>['verify_peer'=>true,'verify_peer_name'=>true,'peer_name'=>$host]]);
    $socket=@stream_socket_client(($c['smtp_security']==='ssl'?'ssl://':'tcp://').$host.':'.$port,$errno,$errstr,8,STREAM_CLIENT_CONNECT,$context);
    if (!$socket) throw new RuntimeException('Mailverbinding niet beschikbaar.');
    stream_set_timeout($socket,8);
    $read = static function(array $codes) use($socket): void {
        $last=''; $lines=0;
        do { $line=fgets($socket,2048); if ($line===false || ++$lines>80) throw new RuntimeException('Geen geldig mailantwoord.'); $last=$line; } while (isset($line[3]) && $line[3]==='-');
        if (!in_array((int)substr($last,0,3),$codes,true)) throw new RuntimeException('Mailserver accepteert het bericht niet.');
    };
    $command = static function(string $line, array $codes) use($socket,$read): void {
        if (fwrite($socket,$line."\r\n")===false) throw new RuntimeException('Mailverbinding onderbroken.');
        $read($codes);
    };
    try {
        $read([220]); $command('EHLO fcz-website',[250]);
        if ($c['smtp_security']==='starttls') {
            $command('STARTTLS',[220]);
            if (!stream_socket_enable_crypto($socket,true,STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('TLS niet beschikbaar.');
            $command('EHLO fcz-website',[250]);
        }
        $command('AUTH LOGIN',[334]); $command(base64_encode($c['smtp_user']),[334]); $command(base64_encode($c['smtp_password']),[235]);
        $command('MAIL FROM:<'.$c['sender'].'>',[250]); $command('RCPT TO:<'.$to.'>',[250,251]); $command('DATA',[354]);
        $domain=substr(strrchr($c['sender'],'@'),1);
        $headers=['From: Fitnesscentrum Zwanenburg <'.$c['sender'].'>','To: <'.$to.'>','Reply-To: <'.$c['recipient'].'>', 'Subject: =?UTF-8?B?'.base64_encode($subject).'?=', 'Date: '.date(DATE_RFC2822), 'Message-ID: <'.$messageId.'@'.$domain.'>', 'MIME-Version: 1.0', 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64'];
        $wire=implode("\r\n",$headers)."\r\n\r\n".chunk_split(base64_encode($body),76,"\r\n").".\r\n";
        $offset=0;
        while ($offset<strlen($wire)) { $n=fwrite($socket,substr($wire,$offset)); if (!$n) throw new RuntimeException('Verzending onderbroken.'); $offset+=$n; }
        $read([250]);
        // DATA acceptance is decisive; a QUIT failure must not cause a duplicate.
        @fwrite($socket,"QUIT\r\n");
    } finally { fclose($socket); }
}
