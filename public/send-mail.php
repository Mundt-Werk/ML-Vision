<?php
/**
 * Contact Form Mail Handler - Public Wrapper
 * Leitet Anfragen an den geschützten Mail-Handler in config/ weiter
 */

// Lade den eigentlichen Mail-Handler aus dem geschützten config-Verzeichnis
require_once __DIR__ . '/../config/send-mail.php';
?>
