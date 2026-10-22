<?php
// Kopieer dit bestand BUITEN public_html naar fcz-config/trial.php.
// Vul uitsluitend gecontroleerde instellingen in. Bewaar dit voorbeeld zonder geheimen in Git.
return [
    'enabled' => false,
    'recipient' => '', // Door de eigenaar bevestigde ontvangende clubmailbox.
    'sender' => '', // Geauthenticeerde afzender op het eigen domein.
    'secret' => '', // Minimaal 32 willekeurige tekens; bijvoorbeeld bin2hex(random_bytes(32)).
    'smtp_host' => 'smtp.hostinger.com',
    'smtp_port' => 465,
    'smtp_security' => 'ssl', // ssl (465) of starttls (587), volgens de mailprovider.
    'smtp_user' => '',
    'smtp_password' => '',
];
