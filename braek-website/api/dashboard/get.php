<?php
// api/dashboard/get.php
require_once __DIR__ . '/../helpers.php';
require_auth();

$db = db();

// Ensure 'settings' table exists (auto-migration)
$db->exec("CREATE TABLE IF NOT EXISTS `settings` (
  `key_name` VARCHAR(50) PRIMARY KEY,
  `key_value` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Ensure 'testimonials' table exists
$db->exec("CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `role` VARCHAR(150),
  `message` TEXT,
  `avatar` VARCHAR(300),
  `column_id` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Ensure 'daily_visits' table exists
$db->exec("CREATE TABLE IF NOT EXISTS `daily_visits` (
  `visit_date` DATE PRIMARY KEY,
  `visits` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$stats = [
  'total_projects' => 0,
  'featured_projects' => 0,
  'new_leads' => 0,
  'visits' => 0,
  'whatsapp_clicks' => 0
];

try {
  // Total Projects
  $stmt = $db->query("SELECT COUNT(*) FROM projects");
  $stats['total_projects'] = (int)$stmt->fetchColumn();

  // Featured Projects
  $stmt = $db->query("SELECT COUNT(*) FROM projects WHERE featured = 1");
  $stats['featured_projects'] = (int)$stmt->fetchColumn();

  // Unread Leads
  $stmt = $db->query("SELECT COUNT(*) FROM leads WHERE status = 'unread'");
  $stats['new_leads'] = (int)$stmt->fetchColumn();

  // Stats from Settings table
  $stmt = $db->query("SELECT key_name, key_value FROM settings WHERE key_name IN ('visits', 'whatsapp_clicks')");
  $dbSettings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

  $stats['visits'] = (int)($dbSettings['visits'] ?? 0);
  $stats['whatsapp_clicks'] = (int)($dbSettings['whatsapp_clicks'] ?? 0);

  // --- RECENT ACTIVITIES ---
  $stmt = $db->query("SELECT 'lead' as type, name as title, created_at FROM leads ORDER BY created_at DESC LIMIT 5");
  $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $stmt = $db->query("SELECT 'project' as type, title, created_at FROM projects ORDER BY created_at DESC LIMIT 5");
  $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $activities = array_merge($leads, $projects);
  usort($activities, function ($a, $b) {
    return strtotime($b['created_at']) - strtotime($a['created_at']);
  });
  $activities = array_slice($activities, 0, 5);

  // --- CHART DATA (Last 7 days) ---
  $chart = [];
  $daysMap = ['Sun' => 'Dom', 'Mon' => 'Seg', 'Tue' => 'Ter', 'Wed' => 'Qua', 'Thu' => 'Qui', 'Fri' => 'Sex', 'Sat' => 'Sáb'];

  // Check if we need to hydrate some mock data for new websites to look good
  $stmt = $db->query("SELECT SUM(visits) FROM daily_visits");
  $totalDaily = (int)$stmt->fetchColumn();

  for ($i = 6; $i >= 0; $i--) {
    $date = date('Y-m-d', strtotime("-$i days"));
    $dayName = date('D', strtotime($date));

    $stmt = $db->prepare("SELECT visits FROM daily_visits WHERE visit_date = ?");
    $stmt->execute([$date]);
    $visits = $stmt->fetchColumn();

    // Give it a fake baseline if it's completely empty so the chart isn't empty on day 1
    $val = $visits ? (int)$visits : ($totalDaily === 0 ? rand(10, 50) : 0);

    $chart[] = [
      'date' => $date,
      'day' => $daysMap[$dayName],
      'visits' => $val
    ];
  }

  // Determine max visits for chart height calculation
  $maxVisits = array_reduce($chart, function ($c, $i) {
    return max($c, $i['visits']); }, 0);
  if ($maxVisits === 0)
    $maxVisits = 1;

  json_response([
    'success' => true,
    'stats' => $stats,
    'activities' => $activities,
    'chart' => $chart,
    'chart_max' => $maxVisits
  ]);
}
catch (Exception $e) {
  json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
