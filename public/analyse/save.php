<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$secret = 'MLV-ANALYSE-2026-n8n-SECRET';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || $input['secret'] !== $secret) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$leadId   = preg_replace('/[^A-Z0-9\-]/', '', strtoupper($input['leadId'] ?? ''));
$html     = $input['html'] ?? '';

if (!$leadId || !$html) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing leadId or html']);
    exit;
}

$dir  = __DIR__;
$file = $dir . '/' . $leadId . '.html';

file_put_contents($file, $html);

echo json_encode([
    'success' => true,
    'url'     => 'https://www.vision-ml.de/public/analyse/' . $leadId . '.html'
]);
