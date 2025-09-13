<?php
// api/send-quote.php
// IMPORTANT: Ne pas modifier chat.php / chatbot.js. Endpoint indépendant pour l'envoi du devis.
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// --------------------
// Configuration (remplacez les placeholders)
// --------------------
$SENDGRID_API_KEY = getenv('SENDGRID_API_KEY') ?: 'REPLACE_WITH_YOUR_SENDGRID_KEY';
$ADMIN_EMAIL = getenv('ADMIN_EMAIL') ?: 'admin@votre-domaine.com';
$ADMIN_NAME = getenv('ADMIN_NAME') ?: 'WEBOOSTMARTINIQUE';
$FROM_EMAIL = getenv('FROM_EMAIL') ?: 'noreply@votre-domaine.com';
$FROM_NAME = getenv('FROM_NAME') ?: 'WEBOOSTMARTINIQUE';
$ALLOWED_ORIGINS = [$_SERVER['HTTP_HOST'] ?? '']; // même origine uniquement

// --------------------
// CORS & headers
// --------------------
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$host = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? '');
if ($origin && strpos($origin, $_SERVER['HTTP_HOST']) !== false) {
  header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// --------------------
// Utils
// --------------------
function respond($code, $data){ http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function ensure_dir($dir){ if(!is_dir($dir)){ mkdir($dir, 0755, true); } }
function uuidv4(){ $data = random_bytes(16); $data[6] = chr(ord($data[6]) & 0x0f | 0x40); $data[8] = chr(ord($data[8]) & 0x3f | 0x80); return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4)); }
function sanitize_text($t){ return htmlspecialchars(trim((string)$t), ENT_QUOTES, 'UTF-8'); }

// Rate limit simple: 5 req / 5 min par IP
function rate_limit_check(){
  $dir = __DIR__ . '/storage/ratelimit'; ensure_dir($dir);
  $ht = $dir . '/.htaccess'; if(!file_exists($ht)){ file_put_contents($ht, "Deny from all\n"); }
  $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
  $key = hash('sha256', $ip . ($_SERVER['HTTP_USER_AGENT'] ?? '')); 
  $file = $dir . '/' . $key . '.json';
  $now = time(); $win = 300; $max = 5; $arr = [];
  if(file_exists($file)) { $arr = json_decode(file_get_contents($file), true) ?: []; }
  $arr = array_values(array_filter($arr, function($t) use ($now,$win){ return ($now - $t) <= $win; }));
  if (count($arr) >= $max) { respond(429, ['ok'=>false,'error'=>'Trop de requêtes, réessayez dans quelques minutes.']); }
  $arr[] = $now; file_put_contents($file, json_encode($arr), LOCK_EX);
}
rate_limit_check();

// --------------------
// Lecture JSON
// --------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { respond(405, ['ok'=>false,'error'=>'Méthode non autorisée']); }
$raw = file_get_contents('php://input'); if(!$raw){ respond(400, ['ok'=>false,'error'=>'Corps de requête vide']); }
$input = json_decode($raw, true); if(json_last_error() !== JSON_ERROR_NONE){ respond(400, ['ok'=>false,'error'=>'JSON invalide']); }

// --------------------
// Validation stricte
// --------------------
$pack = isset($input['pack']) ? preg_replace('/[^a-z]/','', strtolower($input['pack'])) : null;
$allowedPacks = ['essentiel','pro','premium'];
if(!$pack || !in_array($pack, $allowedPacks, true)) respond(400, ['ok'=>false,'error'=>'Pack invalide']);

$customer = $input['customer'] ?? [];
$name = sanitize_text($customer['name'] ?? '');
$email = filter_var($customer['email'] ?? '', FILTER_VALIDATE_EMAIL) ? $customer['email'] : '';
$phone = sanitize_text($customer['phone'] ?? '');
$company = sanitize_text($customer['company'] ?? '');
if(strlen($name) < 2) respond(400, ['ok'=>false,'error'=>'Nom invalide']);
if(!$email) respond(400, ['ok'=>false,'error'=>'Email invalide']);
if(strlen(preg_replace('/[^0-9+\-() ]/','',$phone)) < 6) respond(400, ['ok'=>false,'error'=>'Téléphone invalide']);

$options = is_array($input['options'] ?? null) ? $input['options'] : ($input['options'] ?? []);
$totals = $input['totals'] ?? [];
$total = isset($totals['total']) ? floatval($totals['total']) : 0.0;
$deposit = $pack==='essentiel'?445:($pack==='pro'?645:895);
$delay = $input['delay'] ?? ['min'=>7,'max'=>12];
$notes = sanitize_text($input['notes'] ?? '');
$pages = intval($input['pages'] ?? 0);
$activity = sanitize_text($input['activity'] ?? '');
$payment = sanitize_text($input['payment'] ?? '50_40_10');

// --------------------
// Sauvegarde JSON
// --------------------
$storeDir = __DIR__ . '/storage/quotes'; ensure_dir($storeDir); $ht = $storeDir.'/.htaccess'; if(!file_exists($ht)){ file_put_contents($ht, "Deny from all\n"); }
$id = uuidv4();
$record = [
  'quoteId'=>$id,
  'timestamp'=>date('c'),
  'pack'=>$pack,
  'options'=>$options,
  'pages'=>$pages,
  'activity'=>$activity,
  'totals'=>$totals,
  'deposit'=>$deposit,
  'delay'=>$delay,
  'payment'=>$payment,
  'customer'=>[ 'name'=>$name, 'email'=>$email, 'phone'=>$phone, 'company'=>$company ],
  'notes'=>$notes,
  'meta'=>[
    'ip'=>$_SERVER['REMOTE_ADDR'] ?? '',
    'ua'=>$_SERVER['HTTP_USER_AGENT'] ?? ''
  ]
];
file_put_contents($storeDir."/{$id}.json", json_encode($record, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT), LOCK_EX);

// --------------------
// Emails via SendGrid (fallback: mail())
// --------------------
$subjectCustomer = "Confirmation de devis – {$id}";
$subjectAdmin = "Nouveau devis – {$id}";

$htmlCustomer = "<h2>Merci $name</h2><p>Nous avons bien reçu votre demande.</p><p><strong>Pack:</strong> $pack<br><strong>Total HT:</strong> ".number_format($total,0,',',' ')."€<br><strong>Acompte:</strong> ".number_format($deposit,0,',',' ')."€<br><strong>Délai estimé:</strong> {$delay['min']}–{$delay['max']} jours</p><p>Référence: <strong>$id</strong></p>";
$textCustomer = "Merci $name, nous avons bien reçu votre demande. Pack: $pack, Total HT: $total €, Acompte: $deposit €, Délai: {$delay['min']}–{$delay['max']} j. Réf: $id";

$htmlAdmin = "<h2>Nouveau devis</h2><p><strong>Réf:</strong> $id</p><p><strong>Client:</strong> $name – $email – $phone</p><p><strong>Entreprise:</strong> $company</p><p><strong>Pack:</strong> $pack<br><strong>Total HT:</strong> ".number_format($total,0,',',' ')."€<br><strong>Acompte:</strong> ".number_format($deposit,0,',',' ')."€<br><strong>Délai:</strong> {$delay['min']}–{$delay['max']} j</p><p><strong>Pages:</strong> $pages<br><strong>Activité:</strong> $activity</p><p><strong>Notes:</strong> $notes</p>";
$textAdmin = "Nouveau devis $id\nClient: $name / $email / $phone\nEntreprise: $company\nPack: $pack\nTotal HT: $total €\nAcompte: $deposit €\nDélai: {$delay['min']}–{$delay['max']} j\nPages: $pages\nActivité: $activity\nNotes: $notes";

function send_via_sendgrid($apiKey, $fromEmail, $fromName, $toEmail, $toName, $subject, $html, $text){
  if(!$apiKey || $apiKey==='REPLACE_WITH_YOUR_SENDGRID_KEY') return false;
  $payload = [
    'personalizations'=>[[ 'to'=>[[ 'email'=>$toEmail, 'name'=>$toName ]], 'subject'=>$subject ]],
    'from'=>[ 'email'=>$fromEmail, 'name'=>$fromName ],
    'content'=>[
      [ 'type'=>'text/html', 'value'=>$html ],
      [ 'type'=>'text/plain', 'value'=>$text ]
    ]
  ];
  $ch = curl_init();
  curl_setopt_array($ch, [
    CURLOPT_URL=>'https://api.sendgrid.com/v3/mail/send',
    CURLOPT_POST=>true,
    CURLOPT_RETURNTRANSFER=>true,
    CURLOPT_HTTPHEADER=>[
      'Authorization: Bearer ' . $apiKey,
      'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS=>json_encode($payload),
    CURLOPT_TIMEOUT=>20,
  ]);
  $res = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); $err = curl_error($ch); curl_close($ch);
  if($err){ error_log('SendGrid cURL error: '.$err); return false; }
  return ($code >= 200 && $code < 300);
}

function send_via_mail($fromEmail, $toEmail, $subject, $html){
  $headers = "MIME-Version: 1.0\r\n".
             "Content-type:text/html;charset=UTF-8\r\n".
             "From: WEBOOSTMARTINIQUE <{$fromEmail}>\r\n";
  return @mail($toEmail, $subject, $html, $headers);
}

$okCustomer = send_via_sendgrid($SENDGRID_API_KEY, $FROM_EMAIL, $FROM_NAME, $email, $name, $subjectCustomer, $htmlCustomer, $textCustomer);
if(!$okCustomer){ $okCustomer = send_via_mail($FROM_EMAIL, $email, $subjectCustomer, $htmlCustomer); }

$okAdmin = send_via_sendgrid($SENDGRID_API_KEY, $FROM_EMAIL, $FROM_NAME, $ADMIN_EMAIL, $ADMIN_NAME, $subjectAdmin, $htmlAdmin, $textAdmin);
if(!$okAdmin){ $okAdmin = send_via_mail($FROM_EMAIL, $ADMIN_EMAIL, $subjectAdmin, $htmlAdmin); }

respond(200, ['ok'=>true,'quoteId'=>$id,'emailStatus'=>['customer'=>$okCustomer,'admin'=>$okAdmin]]);