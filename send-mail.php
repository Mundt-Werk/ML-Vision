<?php
/**
 * Contact Form Mail Handler - Root Wrapper
 * Leitet Anfragen an den Mail-Handler in public/ weiter
 */

// Lade den Mail-Handler aus dem public-Verzeichnis
require_once __DIR__ . '/public/send-mail.php';
?>
