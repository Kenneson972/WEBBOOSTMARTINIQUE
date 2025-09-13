<?php
// api/chat.php - Minimal, robuste, même-origine. Compatible 02switch.
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');
header('Content-Type: application/json; charset=utf-8');

// Autoriser même origine (navigateur en front)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false,'error'=>'Méthode non autorisée']); exit; }

$raw = file_get_contents('php://input');
if (!$raw) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Requête vide']); exit; }
$input = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'JSON invalide']); exit; }

$message = isset($input['message']) ? trim((string)$input['message']) : '';
session_write_close();

if ($message === '') { echo json_encode(['ok'=>false,'error'=>'Message manquant']); exit; }

// Fallback sans clé IA: réponse polie + miroir de la question
$reply = "Merci pour votre message. Je suis Élise.\n" .
         "Je vous réponds rapidement. Votre question: \"" . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . "\"";

echo json_encode([
  'ok' => true,
  'reply' => $reply,
  'ts' => date('c')
], JSON_UNESCAPED_UNICODE);