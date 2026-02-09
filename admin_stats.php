<?php
$dir = __DIR__ . "/orders";

$stats = [];
$grandTotal = 0;

foreach (glob($dir . "/*.json") as $file) {
  $order = json_decode(file_get_contents($file), true);

  foreach ($order["items"] as $item) {
    $name  = $item["name"];
    $qty   = (int)$item["qty"];
    $price = (float)$item["price"];
    $sum   = $qty * $price;

    if (!isset($stats[$name])) {
      $stats[$name] = [
        "qty" => 0,
        "price" => $price,
        "total" => 0
      ];
    }

    $stats[$name]["qty"] += $qty;
    $stats[$name]["total"] += $sum;
    $grandTotal += $sum;
  }
}
?>
<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="UTF-8">
<title>Admin Πωλήσεις</title>
<style>
body { font-family: Arial; padding:20px }
table { border-collapse: collapse; width:500px }
th, td { border:1px solid #ccc; padding:8px; text-align:center }
th { background:#eee }
</style>
</head>
<body>

<h2>📊 Αναλυτικές Πωλήσεις</h2>

<table>
<tr>
<th>Προϊόν</th>
<th>Τεμάχια</th>
<th>Τιμή (€)</th>
<th>Σύνολο (€)</th>
</tr>

<?php foreach ($stats as $name => $row): ?>
<tr>
<td><?= htmlspecialchars($name) ?></td>
<td><?= $row["qty"] ?></td>
<td><?= number_format($row["price"], 2) ?></td>
<td><?= number_format($row["total"], 2) ?></td>
</tr>
<?php endforeach; ?>

<tr>
<th colspan="3">💰 Γενικό Σύνολο</th>
<th><?= number_format($grandTotal, 2) ?> €</th>
</tr>

</table>

</body>
</html>
