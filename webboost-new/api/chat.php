<?php
/**
 * WebBoost Martinique - Chat API avec Élise
 * Backend PHP pour 02switch
 * Intégration OpenAI directe
 */

// Headers CORS et sécurité
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: https://weboostmartinique.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

// Gestion preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Seulement POST autorisé
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed', 'success' => false]));
}

// Lecture input JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['message'])) {
    http_response_code(400);
    exit(json_encode(['error' => 'Message required', 'success' => false]));
}

$userMessage = trim($input['message']);
$sessionId = $input['session_id'] ?? 'session_' . time();
$model = $input['model'] ?? 'gpt-4o-mini';

if (empty($userMessage)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Empty message', 'success' => false]));
}

// Configuration OpenAI
$openaiKey = getenv('OPENAI_API_KEY') ?: '';

// Personnalité Élise complète
$elisePersona = "Tu es Élise Morel, conseillère commerciale de WebBoost Martinique. Tu es professionnelle mais chaleureuse, experte en création de sites web pour TPE/PME martiniquaises.

PERSONNALITÉ ÉLISE :
- Conseillère commerciale experte (3 ans d'expérience)
- Connaissance parfaite du marché martiniquais
- Approche consultative et bienveillante  
- Spécialiste conversion digitale TPE/PME
- Utilise des emojis avec modération pour humaniser

SERVICES WEBBOOST MARTINIQUE :
- Pack Essentiel (890€ HT) : 3 pages, SEO base, mobile-first, 1 révision, délai 10j, acompte 445€
- Pack Pro (1290€ HT) : 5-6 pages, SEO étendu, LCP<2.5s, GA4, 2 révisions, délai 7-10j, acompte 645€ [LE PLUS POPULAIRE]  
- Pack Premium (1790€ HT) : 6-8 pages + conversion, tracking avancé, formation 45min, délai 10-12j, acompte 895€

MODALITÉS :
- Paiement échelonné : 50% commande / 40% avant mise en ligne / 10% livraison
- Délais WebBoost : 7-12 jours (vs 4-8 semaines concurrence)
- Garanties : Satisfait ou remboursé 15j, délai respecté ou remboursé
- Support : 7j/7 pendant le projet, révisions incluses selon pack

CONTEXTE MARTINIQUE :
74% de la population martiniquaise est en difficulté avec le numérique (vs 33% en métropole).
WebBoost accompagne spécifiquement les entrepreneurs locaux avec tarifs adaptés et approche pédagogique.

TON RÔLE COMMERCIAL :
1. Accueillir chaleureusement et te présenter professionnellement
2. Découvrir le secteur d'activité (restaurant, commerce, services, santé, beauté, artisan)  
3. Comprendre les besoins, objectifs et situation actuelle
4. Recommander le pack le mieux adapté avec justification claire
5. Gérer les objections (prix = comparaison concurrence, délais = notre rapidité, sécurité = garanties)
6. Guider vers la commande en ligne ou contact direct pour urgence
7. Toujours demander les coordonnées pour devis personnalisé

EXEMPLES RÉPONSES PAR SECTEUR :
- Restaurant : Pack Pro recommandé (galerie photos plats, réservation en ligne, SEO local)
- Commerce : Pack Essentiel/Pro selon ambition (catalogue produits, optimisation locale)  
- Services B2B : Pack Pro/Premium (pages services, formulaires devis, témoignages)

Réponds naturellement en français, sois consultative mais guide vers la vente. Mentionne les acomptes (50%) pour rassurer sur l'investissement initial.";

// Fonction fallback Élise (si OpenAI indisponible)
function getEliseFallback($message) {
    $text = strtolower($message);
    
    // Salutations
    if (strpos($text, 'bonjour') !== false || strpos($text, 'salut') !== false || strpos($text, 'hello') !== false) {
        return "Bonjour ! 😊 Je suis Élise, votre conseillère commerciale WebBoost Martinique.\n\nJe suis spécialisée dans l'accompagnement des entreprises martiniquaises pour leur transformation digitale.\n\nComment puis-je vous aider avec votre projet web aujourd'hui ?";
    }
    
    // Prix/Tarifs
    if (strpos($text, 'prix') !== false || strpos($text, 'tarif') !== false || strpos($text, 'coût') !== false) {
        return "💰 **Excellente question ! Nos tarifs sont spécialement adaptés au marché martiniquais :**\n\n**Pack Essentiel** - 890€ HT\n• Acompte : 445€ seulement\n• 3 pages + SEO base + mobile\n\n**Pack Pro** - 1 290€ HT ⭐\n• Acompte : 645€ seulement  \n• 5-6 pages + SEO étendu + GA4\n\n**Pack Premium** - 1 790€ HT\n• Acompte : 895€ seulement\n• 6-8 pages + conversion + formation\n\n**Paiement échelonné 50/40/10 - Pour quel secteur d'activité ?**";
    }
    
    // Restaurant
    if (strpos($text, 'restaurant') !== false || strpos($text, 'resto') !== false) {
        return "🍽️ **Parfait ! Les restaurants sont ma spécialité !**\n\nPour votre restaurant, je recommande fortement le **Pack Pro** (1 290€ HT) :\n\n✨ **Galerie photos** - Mettez vos plats en valeur\n📱 **Réservation en ligne** - Plus de clients le soir  \n🇲🇶 **SEO local** - \"restaurant Fort-de-France\"\n⭐ **Avis Google** - Gérez votre e-réputation\n\n**Acompte : seulement 645€ pour commencer**\n\nAvez-vous déjà un site web actuellement ?";
    }
    
    // Commerce
    if (strpos($text, 'commerce') !== false || strpos($text, 'boutique') !== false) {
        return "🛍️ **Excellent ! Le commerce local, c'est mon domaine !**\n\nSelon votre ambition, 2 options :\n\n**Pack Essentiel** (890€ HT) - Boutique physique\n• Site vitrine élégant + infos pratiques\n• Acompte : 445€\n\n**Pack Pro** (1 290€ HT) - Plus d'ambition\n• Catalogue produits + SEO local renforcé  \n• Acompte : 645€\n\n**Que vendez-vous exactement ?** Cela m'aidera à mieux vous conseiller ! 😊";
    }
    
    // Délais
    if (strpos($text, 'délai') !== false || strpos($text, 'temps') !== false) {
        return "⚡ **Notre signature : la rapidité martiniquaise !**\n\nContrairement à la concurrence (6-8 semaines), nous livrons en **7 à 12 jours ouvrés maximum**.\n\n**Pourquoi si rapide ?**\n✅ Équipe 100% locale (pas de décalage)\n✅ Process optimisé depuis 3 ans\n✅ Communication directe\n\n**Vos délais garantis :**\n• Pack Essentiel : 10 jours max\n• Pack Pro : 7-10 jours max\n• Pack Premium : 10-12 jours max\n\n**Et c'est garanti !** Délai non respecté = remboursement intégral. 🛡️";
    }
    
    // Urgence
    if (strpos($text, 'urgent') !== false || strpos($text, 'vite') !== false) {
        return "🚨 **Urgence parfaitement comprise !**\n\nPour un traitement express :\n📱 **Kenneson en direct** - https://wa.me/596000000\n⚡ **Démarrage immédiat** si brief complet\n🎯 **Priorité absolue** sur notre planning\n\n**Quelle est votre situation d'urgence ?**\n(lancement imminent, concurrent, saison haute...)";
    }
    
    // Garanties
    if (strpos($text, 'garantie') !== false || strpos($text, 'remboursé') !== false) {
        return "🛡️ **Toutes mes garanties personnelles :**\n\n✅ **Satisfait ou remboursé** - 15 jours complets\n✅ **Délai respecté ou remboursé** - Engagement ferme\n✅ **Paiement sécurisé** - Stripe certifié SSL\n✅ **Support 7j/7** pendant votre projet\n✅ **0% remboursement** en 3 ans d'activité !\n\nQu'est-ce qui vous préoccupe exactement ?";
    }
    
    // Réponse générale
    return "😊 **Je comprends votre demande !**\n\nPour mieux vous conseiller de manière personnalisée :\n\n• Quel type d'entreprise dirigez-vous ?\n• Avez-vous un site web actuellement ?\n• Quel est votre objectif principal ?\n\n**Mon rôle :** vous trouver LA solution parfaite selon votre situation unique ! 🎯";
}

// Tentative OpenAI si clé configurée
if (!empty($openaiKey) && $openaiKey !== 'sk-votre-cle-openai-ici') {
    try {
        $payload = [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => $elisePersona],
                ['role' => 'user', 'content' => $userMessage]
            ],
            'max_tokens' => 800,
            'temperature' => 0.7,
            'frequency_penalty' => 0.1,
            'presence_penalty' => 0.1
        ];

        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $openaiKey,
                'Content-Type: application/json'
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode === 200 && !$error) {
            $data = json_decode($response, true);
            
            if (isset($data['choices'][0]['message']['content'])) {
                $eliseResponse = trim($data['choices'][0]['message']['content']);
                
                // Log conversation (optionnel)
                error_log("Élise Chat - User: $userMessage | Élise: " . substr($eliseResponse, 0, 100));
                
                // Réponse réussie
                echo json_encode([
                    'reply' => $eliseResponse,
                    'model' => $model,
                    'provider' => 'openai',
                    'personality' => 'elise',
                    'session_id' => $sessionId,
                    'timestamp' => date('c'),
                    'success' => true
                ]);
                exit();
            }
        } else {
            // Log erreur OpenAI
            error_log("OpenAI Error - Code: $httpCode, Error: $error, Response: $response");
        }
        
    } catch (Exception $e) {
        // Log exception OpenAI
        error_log("OpenAI Exception: " . $e->getMessage());
    }
}

// Fallback Élise local si OpenAI indisponible
$fallbackResponse = getEliseFallback($userMessage);

// Log fallback
error_log("Élise Fallback - User: $userMessage | Élise: " . substr($fallbackResponse, 0, 100));

// Réponse fallback
echo json_encode([
    'reply' => $fallbackResponse,
    'model' => 'fallback',
    'provider' => 'elise_local',
    'personality' => 'elise',
    'session_id' => $sessionId,
    'timestamp' => date('c'),
    'success' => true
]);

?>