<?php
/**
 * ElevenLabs Token Generator - Public Wrapper
 * Leitet Token-Anfragen an den geschützten Handler in config/ weiter
 */

// Lade den eigentlichen Token-Handler aus dem geschützten config-Verzeichnis
require_once __DIR__ . '/../config/elevenlabs-token.php';
?>
