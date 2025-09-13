<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
/**
 * WebBoost Martinique - Chat API avec Élise - Version MySQL mémoire persistante
 * Auteur: [Ton Nom]
 */

// ------- CONFIG CORS ET CONTENT-TYPE -------
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: https://weboostmartinique.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

// ------- LECTURE INPUT -------
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['message'])) {
    http_response_code(400);
    exit(json_encode(['error' => 'Message required', 'success' => false]));
}

$userMessage = trim($input['message']);
$sessionId = $input['session_id'] ?? 'sess_' . bin2hex(random_bytes(8));

if (empty($userMessage)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Empty message', 'success' => false]));
}

// ------- CONNEXION BASE DE DONNÉES -------
$dsn = "mysql:host=localhost;dbname=fawo6188_webboostbot;charset=utf8mb4";
$dbUser = "fawo6188_elisebot";          // ⚠️ change ceci
$dbPass = "Kenneson065299";              // ⚠️ change ceci

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
} catch (PDOException $e) {
    exit(json_encode(['success' => false, 'error' => "Erreur DB: " . $e->getMessage()]));
}

// ------- FONCTIONS DB -------
function saveMessage($pdo, $sessionId, $role, $content) {
    $stmt = $pdo->prepare("INSERT INTO chat_history (session_id, role, message) VALUES (?, ?, ?)");
    $stmt->execute([$sessionId, $role, $content]);
}

function getHistory($pdo, $sessionId, $limit = 20) {
    $stmt = $pdo->prepare("SELECT role, message FROM chat_history WHERE session_id = ? ORDER BY id ASC LIMIT ?");
    $stmt->bindValue(1, $sessionId, PDO::PARAM_STR);
    $stmt->bindValue(2, $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// ------- CHARGER VARIABLES .ENV -------
function loadEnvironmentVariables() {
    $paths = ['.env','../.env','../backend/.env',__DIR__.'/.env',__DIR__.'/../.env'];
    foreach ($paths as $path) {
        if (file_exists($path)) {
            foreach (explode("\n", file_get_contents($path)) as $line) {
                $line = trim($line);
                if ($line && strpos($line, '#') !== 0) {
                    [$k, $v] = array_pad(explode("=", $line, 2), 2, null);
                    $_ENV[$k] = trim($v, '"\'');
                    putenv("$k={$_ENV[$k]}");
                }
            }
            return true;
        }
    }
    return false;
}
loadEnvironmentVariables();

// ------- VALIDATION CLÉ OPENAI (avec diagnostic) -------
function validateOpenAIKey($key) {
    $key = trim($key, " \t\n\r\0\x0B\"'");
    if (!preg_match('/^sk-(?:proj-)?[a-zA-Z0-9_\-]{20,}/', $key)) return false;
    return strlen($key) >= 30 ? $key : false;
}

// Diagnostic : clé brute
$rawKey = $_ENV['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY') ?? '';
if (!$rawKey) {
    echo json_encode([
        'success' => false,
        'error' => "Clé OpenAI non trouvée dans .env"
    ]);
    exit();
}

$trimmedKey = trim($rawKey, " \t\n\r\0\x0B\"'");
$validatedKey = validateOpenAIKey($trimmedKey);

if (!$validatedKey) {
    echo json_encode([
        'success' => false,
        'error' => "Clé OpenAI mal formatée ou tronquée",
        'cle_detectee' => substr($trimmedKey, 0, 20) . '...'
    ]);
    exit();
}

$openaiKey = $validatedKey;

// ------- PERSONA ELiSE -------
$elisePersona = <<<EOT
🤖 Assistant Bot "WebBoost Pro" – Identité & Ton
Tu es Élise Morel, 32 ans, spécialiste en création de sites web haute performance pour entrepreneurs martiniquais.
Tu combines une expertise pointue avec un ton humain, chaleureux et naturel.
Tu parles comme une personne réelle, tu t’adaptes au vocabulaire du client, et tu peux utiliser de petites touches d’expressions locales martiniquaises (sans en abuser).

🎯 Objectif principal
Aider ton interlocuteur à comprendre, choisir et passer à l’action pour créer un site performant en 7 à 12 jours, tout en le mettant en confiance.

💼 Expertise & USP
- Délai court : 7-12 jours au lieu de 4-8 semaines
- SEO local + international
- Performance mobile LCP < 2,5s
- Conversion optimisée
- Tracking avancé : GA4, Search Console, suivi des clics et appels
- Sites bilingues (FR/EN), optimisés tourisme
- Design mobile-first
- Solutions adaptées TPE/PME budget maîtrisé

📦 Offres
- Pack Starter : 3 pages, SEO local, 1 révision – 10j max
- Pack Business : 5-6 pages, SEO étendu, 2 révisions – 7-10j
- Pack Premium : 6-8 pages, conversion optimisée, formation 45 min – 10-12j

✅ Garanties
- Satisfait ou remboursé 15 jours
- Délai respecté ou remboursé
- Paiement échelonné 50/40/10
- Correction bug gratuite 15j après livraison

🗣️ Style de communication
- Chaleureux et pro : “Super idée ! On peut tout à fait faire ça ensemble…”
- Adaptation au client : si artisan → concret et simple, si pro du tourisme → focus sur bilingue et visuels attractifs
- Rappelle subtilement les avantages → délais, garanties, résultats
- Pose des questions précises pour comprendre le besoin avant de conseiller

⚙️ Structure de réponse à respecter
1. **Engagement humain** : salutation + reformulation du besoin perçue
2. **Analyse rapide** : point clé du contexte ou difficulté du client
3. **Proposition** : pack + délais + bénéfices clairs
4. **Preuve/Confiance** : garantie, exemple client, résultat concret
5. **Call-to-action** : inviter à poursuivre/expliquer, proposer RDV ou appel

⚠️ Consigne finale
Si la conversation est déjà commencée, ne redis pas “Bonjour” ni ta présentation complète. Continue directement comme dans une discussion naturelle.
EOT;

// ------- SAUVEGARDE MESSAGE UTILISATEUR -------
saveMessage($pdo, $sessionId, 'user', $userMessage);

// ------- CRÉER L'HISTORIQUE POUR OPENAI -------
$history = getHistory($pdo, $sessionId, 30);

// Filtrer les entrées vides et normaliser
$filteredHistory = array_filter($history, function($msg) {
    return isset($msg['message']) && trim($msg['message']) !== '';
});

$formattedHistory = array_map(function($msg) {
    return [
        'role' => $msg['role'],
        'content' => $msg['message']
    ];
}, $filteredHistory);

// Construire la liste finale pour OpenAI
$messages = array_merge(
    [['role' => 'system', 'content' => $elisePersona]],
    $formattedHistory
);
// ------- APPEL OPENAI -------
if ($openaiKey) {
    try {
        $payload = [
            'model' => 'gpt-4o-mini',
            'messages' => $messages,
            'max_tokens' => 800,
            'temperature' => 0.7
        ];

        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $openaiKey,
                'Content-Type: application/json',
                'User-Agent' => 'WebBoost-Martinique-Chatbot/1.0'
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
    echo json_encode([
        'success' => false,
        'error' => "Erreur cURL: " . $curlError
    ]);
    exit();
}

if ($httpCode !== 200) {
    echo json_encode([
        'success' => false,
        'error' => "Erreur OpenAI HTTP $httpCode",
        'details' => $response
    ]);
    exit();
};

        $data = json_decode($response, true);
        if (!isset($data['choices'][0]['message']['content'])) {
            throw new Exception("Réponse OpenAI invalide");
        }

        $eliseResponse = trim($data['choices'][0]['message']['content']);

        // Sauvegarder réponse Élise
        saveMessage($pdo, $sessionId, 'assistant', $eliseResponse);

        echo json_encode([
            'success' => true,
            'response' => $eliseResponse,
            'provider' => 'openai',
            'model' => 'gpt-4o-mini',
            'session_id' => $sessionId,
            'timestamp' => date('c')
        ]);
        exit();

    } catch (Exception $e) {
        error_log("[OpenAI] " . $e->getMessage());
    }
}

// ------- FALLBACK -------
function getEliseFallback($msg) {
    return "Désolée, je ne suis pas dispo pour le moment.";
}
$fallback = getEliseFallback($userMessage);
saveMessage($pdo, $sessionId, 'assistant', $fallback);
echo json_encode([
    'success' => true,
    'response' => $fallback,
    'provider' => 'elise_local',
    'model' => 'fallback',
    'session_id' => $sessionId,
    'timestamp' => date('c')
]);
