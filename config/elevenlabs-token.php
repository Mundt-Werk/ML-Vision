<?php
/**
 * ElevenLabs Voice Agent - Signed Token Generator
 *
 * Dieses Script generiert signierte Tokens für den ElevenLabs Voice Agent.
 * Der API Key bleibt sicher im Backend und wird niemals ans Frontend gesendet.
 *
 * WICHTIG: Diese Datei ist durch .htaccess geschützt!
 */

// Verhindere direkten Zugriff
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['error' => 'Nur POST-Anfragen erlaubt']));
}

// Setze Header für JSON Response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // In Produktion auf Ihre Domain beschränken
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Lade Konfiguration
require_once __DIR__ . '/config.php';

try {
    // Rate Limiting - Max 10 Token-Anfragen pro Minute pro IP
    $ip = $_SERVER['REMOTE_ADDR'];
    $rate_limit_file = sys_get_temp_dir() . '/elevenlabs_rate_limit_' . md5($ip) . '.json';
    $now = time();
    $time_window = 60; // 1 Minute
    $max_requests = 10;

    if (file_exists($rate_limit_file)) {
        $data = json_decode(file_get_contents($rate_limit_file), true);
        $requests = array_filter($data['requests'], function($timestamp) use ($now, $time_window) {
            return ($now - $timestamp) < $time_window;
        });

        if (count($requests) >= $max_requests) {
            http_response_code(429);
            die(json_encode(['error' => 'Zu viele Anfragen. Bitte versuchen Sie es in einer Minute erneut.']));
        }

        $requests[] = $now;
        file_put_contents($rate_limit_file, json_encode(['requests' => $requests]));
    } else {
        file_put_contents($rate_limit_file, json_encode(['requests' => [$now]]));
    }

    // Generiere signierte Anfrage an ElevenLabs
    $agent_id = ELEVENLABS_AGENT_ID;
    $api_key = ELEVENLABS_API_KEY;

    // ElevenLabs API Endpoint für Conversation Token
    $endpoint = "https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id={$agent_id}";

    // cURL Request an ElevenLabs
    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'xi-api-key: ' . $api_key,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    // Fehlerbehandlung
    if ($curl_error) {
        throw new Exception('Verbindungsfehler: ' . $curl_error);
    }

    if ($http_code !== 200) {
        throw new Exception('ElevenLabs API Fehler (HTTP ' . $http_code . '): ' . $response);
    }

    $data = json_decode($response, true);

    if (!$data || !isset($data['signed_url'])) {
        throw new Exception('Ungültige API Response von ElevenLabs');
    }

    // Erfolgreiche Response mit signierter URL
    echo json_encode([
        'success' => true,
        'signed_url' => $data['signed_url'],
        'agent_id' => $agent_id
    ]);

} catch (Exception $e) {
    // Fehler-Response (Details nur in Development-Mode)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Token-Generierung fehlgeschlagen',
        // 'details' => $e->getMessage() // Nur für Debugging aktivieren
    ]);
}
?>
