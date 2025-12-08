<?php
/**
 * CSRF Token Generator
 * Generiert ein sicheres CSRF-Token für das Kontaktformular
 */

session_start();

// Generiere CSRF-Token wenn noch nicht vorhanden
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Gebe Token als JSON zurück
header('Content-Type: application/json');
echo json_encode(['csrf_token' => $_SESSION['csrf_token']]);
?>
