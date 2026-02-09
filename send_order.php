<?php
header("Content-Type: application/json");


// 🔐 Telegram στοιχεία
$botToken = "8591781143:AAHW7Z9uz6fuQtzN7VgqqyO2y-WNnh7Dscg";
$chatId   = "5660210769";

// 📥 Δεδομένα από JS
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["message"])) {
  http_response_code(400);
  echo json_encode(["ok" => false]);
  exit;
}

$message = $data["message"];
$dir = __DIR__ . "/orders";
if (!is_dir($dir)) {
  mkdir($dir, 0777, true);
}
$filename = $dir . "/order_" . date("Y-m-d_H-i-s") . ".txt";
file_put_contents($filename, $message);
/* ===============================
   📊 ΣΤΑΤΙΣΤΙΚΑ ΠΡΟΪΟΝΤΩΝ
================================ */

if (isset($data["items"])) {

  $statsDir = __DIR__ . "/stats";
  if (!is_dir($statsDir)) {
    mkdir($statsDir, 0777, true);
  }

  $totalsFile = $statsDir . "/totals.json";

  if (!file_exists($totalsFile)) {
    file_put_contents($totalsFile, json_encode([]));
  }

  $totals = json_decode(file_get_contents($totalsFile), true);

  foreach ($data["items"] as $item) {
    $name  = $item["name"];
    $qty   = (int)$item["qty"];
    $price = (float)$item["price"];
    $sum   = $qty * $price;

    if (!isset($totals[$name])) {
      $totals[$name] = [
        "qty" => 0,
        "total" => 0,
        "price" => $price
      ];
    }

    $totals[$name]["qty"] += $qty;
    $totals[$name]["total"] += $sum;
  }

  file_put_contents(
    $totalsFile,
    json_encode($totals, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
  );
}

/* ===============================
   📤 ΑΠΟΣΤΟΛΗ TELEGRAM
================================ */


$url = "https://api.telegram.org/bot{$botToken}/sendMessage";

$postData = [
  "chat_id" => $chatId,
  "text"    => $message
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($result === false || $httpCode !== 200) {
  http_response_code(500);
  echo json_encode([
    "ok" => false,
    "error" => "Telegram API failed",
    "httpCode" => $httpCode,
    "result" => $result
  ]);
  exit;
}

echo json_encode(["ok" => true]);
