<?php
/**
 * Contact Form Mail Handler
 * Verwendet PHPMailer für sichere E-Mail-Versendung via SMTP
 */

// Verhindere direkten Zugriff
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'message' => 'Nur POST-Anfragen erlaubt']));
}

// Setze Header für JSON Response
header('Content-Type: application/json');

// CSRF-Schutz
session_start();
if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    http_response_code(403);
    die(json_encode(['success' => false, 'message' => 'Ungültige Anfrage. Bitte laden Sie die Seite neu.']));
}

// Rate Limiting - Max 3 Anfragen pro 5 Minuten pro IP
$ip = $_SERVER['REMOTE_ADDR'];
$rate_limit_file = sys_get_temp_dir() . '/rate_limit_' . md5($ip) . '.json';
$now = time();
$time_window = 300; // 5 Minuten
$max_requests = 3;

if (file_exists($rate_limit_file)) {
    $data = json_decode(file_get_contents($rate_limit_file), true);
    $requests = array_filter($data['requests'], function($timestamp) use ($now, $time_window) {
        return ($now - $timestamp) < $time_window;
    });

    if (count($requests) >= $max_requests) {
        http_response_code(429);
        die(json_encode(['success' => false, 'message' => 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.']));
    }

    $requests[] = $now;
    file_put_contents($rate_limit_file, json_encode(['requests' => $requests]));
} else {
    file_put_contents($rate_limit_file, json_encode(['requests' => [$now]]));
}

// Lade Konfiguration
require_once 'config.php';

// Lade PHPMailer
// Option 1: Via Composer (empfohlen)
// require 'vendor/autoload.php';

// Option 2: Manueller Import (falls PHPMailer manuell heruntergeladen wurde)
// Option 2: Manueller Import (falls PHPMailer manuell heruntergeladen wurde)
require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    // Honeypot-Schutz gegen Spam-Bots
    if (!empty($_POST['website'])) {
        // Bot erkannt - Honeypot-Feld wurde ausgefüllt
        http_response_code(200);
        die(json_encode(['success' => true, 'message' => 'Vielen Dank für Ihre Nachricht!']));
    }

    // Cloudflare Turnstile Validierung
    $turnstileToken = isset($_POST['cf-turnstile-response']) ? $_POST['cf-turnstile-response'] : '';

    if (empty($turnstileToken)) {
        http_response_code(400);
        die(json_encode(['success' => false, 'message' => 'Bitte bestätigen Sie, dass Sie ein Mensch sind.']));
    }

    // Verifiziere Turnstile Token mit Cloudflare
    $turnstileVerifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    $turnstileData = [
        'secret' => TURNSTILE_SECRET_KEY,
        'response' => $turnstileToken,
        'remoteip' => $_SERVER['REMOTE_ADDR']
    ];

    $turnstileOptions = [
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query($turnstileData)
        ]
    ];

    $turnstileContext = stream_context_create($turnstileOptions);
    $turnstileResult = file_get_contents($turnstileVerifyUrl, false, $turnstileContext);
    $turnstileResponse = json_decode($turnstileResult, true);

    if (!$turnstileResponse || !$turnstileResponse['success']) {
        http_response_code(400);
        die(json_encode([
            'success' => false,
            'message' => 'Turnstile-Verifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.'
        ]));
    }

    // Validiere und bereinige Eingaben
    $vorname = isset($_POST['vorname']) ? trim(htmlspecialchars($_POST['vorname'], ENT_QUOTES, 'UTF-8')) : '';
    $nachname = isset($_POST['nachname']) ? trim(htmlspecialchars($_POST['nachname'], ENT_QUOTES, 'UTF-8')) : '';
    $email = isset($_POST['email']) ? trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL)) : '';
    $telefon = isset($_POST['telefon']) ? trim(htmlspecialchars($_POST['telefon'], ENT_QUOTES, 'UTF-8')) : '';
    $nachricht = isset($_POST['nachricht']) ? trim(htmlspecialchars($_POST['nachricht'], ENT_QUOTES, 'UTF-8')) : '';
    $datenschutz = isset($_POST['datenschutz']) ? $_POST['datenschutz'] : '';

    // Validierung
    $errors = [];

    if (empty($vorname)) {
        $errors[] = 'Vorname ist erforderlich';
    }

    if (empty($email)) {
        $errors[] = 'E-Mail ist erforderlich';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Ungültige E-Mail-Adresse';
    }

    if (empty($nachricht)) {
        $errors[] = 'Nachricht ist erforderlich';
    }

    if ($datenschutz !== 'on') {
        $errors[] = 'Bitte akzeptieren Sie die Datenschutzerklärung';
    }

    // Wenn Fehler vorhanden, sende Fehler-Response
    if (!empty($errors)) {
        echo json_encode([
            'success' => false,
            'message' => implode(', ', $errors)
        ]);
        exit;
    }

    // PHPMailer Instanz erstellen
    $mail = new PHPMailer(true);

    // SMTP Konfiguration
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USERNAME;
    $mail->Password = SMTP_PASSWORD;
    $mail->SMTPSecure = SMTP_ENCRYPTION;
    $mail->Port = SMTP_PORT;
    $mail->CharSet = 'UTF-8';

    // Absender und Empfänger
    $mail->setFrom(FROM_EMAIL, FROM_NAME);
    $mail->addAddress(TO_EMAIL, TO_NAME);
    $mail->addReplyTo($email, $vorname . ' ' . $nachname);

    // E-Mail Inhalt
    $mail->isHTML(true);
    $mail->Subject = 'Neue Kontaktanfrage von ' . $vorname . ' ' . $nachname;

    // HTML E-Mail Body
    $htmlBody = '
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                background: #f2f4f8;
                padding: 0;
                margin: 0;
                color: #333;
            }
            .wrapper {
                max-width: 640px;
                margin: 30px auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 8px 25px rgba(0,0,0,0.12);
                border: 1px solid #e1e1e1;
            }
            .header {
                background: linear-gradient(135deg, #04A9D4 0%, #037ea4 100%);
                color: white;
                text-align: center;
                padding: 25px 30px;
            }
            .header h2 {
                margin: 0;
                font-size: 24px;
                letter-spacing: 0.5px;
            }
            .header p {
                margin: 8px 0 0 0;
                opacity: 0.95;
            }
            .content {
                padding: 30px;
            }
            .section-title {
                font-size: 18px;
                color: #04A9D4;
                margin-bottom: 15px;
                border-left: 4px solid #04A9D4;
                padding-left: 10px;
                font-weight: bold;
            }
            .field {
                margin-bottom: 18px;
            }
            .label {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 4px;
                color: #333;
            }
            .value {
                background: #f8f9fb;
                border: 1px solid #dfe3e8;
                border-radius: 6px;
                padding: 10px 12px;
                color: #333;
            }
            .value a {
                color: #04A9D4;
                text-decoration: none;
            }
            .footer {
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #666;
                background: #f7f9fa;
                border-top: 1px solid #e6e6e6;
            }
        </style>
    </head>
    <body>

    <div class="wrapper">

        <div class="header">
            <h2>Neue Kontaktanfrage</h2>
            <p>ML Vision Kontaktformular</p>
        </div>

        <div class="content">

            <div class="section-title">Kontaktdaten</div>

            <div class="field">
                <div class="label">Vorname</div>
                <div class="value">' . $vorname . '</div>
            </div>

            <div class="field">
                <div class="label">Nachname</div>
                <div class="value">' . ($nachname ?: '-') . '</div>
            </div>

            <div class="field">
                <div class="label">E-Mail</div>
                <div class="value"><a href="mailto:' . $email . '">' . $email . '</a></div>
            </div>

            <div class="field">
                <div class="label">Telefon</div>
                <div class="value">' . ($telefon ?: '-') . '</div>
            </div>

            <div class="section-title" style="margin-top:25px;">Nachricht</div>

            <div class="field">
                <div class="value">' . nl2br($nachricht) . '</div>
            </div>

        </div>

        <div class="footer">
            Diese Nachricht wurde automatisch über das Kontaktformular von ML Vision generiert.<br>
            Gesendet am: ' . date("d.m.Y H:i:s") . '
        </div>

    </div>

    </body>
    </html>
    ';

    $mail->Body = $htmlBody;

    // Alternativ-Text für E-Mail-Clients ohne HTML
    $mail->AltBody = "Neue Kontaktanfrage\n\n" .
                     "Vorname: $vorname\n" .
                     "Nachname: " . ($nachname ?: '-') . "\n" .
                     "E-Mail: $email\n" .
                     "Telefon: " . ($telefon ?: '-') . "\n\n" .
                     "Nachricht:\n$nachricht\n\n" .
                     "Gesendet am: " . date('d.m.Y H:i:s');

    // E-Mail senden
    $mail->send();

    // Erfolgs-Response
    echo json_encode([
        'success' => true,
        'message' => 'Vielen Dank für Ihre Nachricht! Wir werden uns schnellstmöglich bei Ihnen melden.'
    ]);

} catch (Exception $e) {
    // Fehler-Response
    echo json_encode([
        'success' => false,
        'message' => 'Beim Senden der Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
        'error' => $mail->ErrorInfo ?? $e->getMessage()
    ]);
}
?>
