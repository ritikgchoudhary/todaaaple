<?php
// simulate_network.php
// Usage: /simulate_network.php?ref=REF123&depth=3&width=3

function generateNode($label, $depth, $width, &$counter) {
    $nodeId = $label . '-' . $counter++;
    $node = [
        'id' => $nodeId,
        'label' => $label,
        'children' => []
    ];

    if ($depth <= 1) return $node;

    for ($i = 1; $i <= $width; $i++) {
        $childLabel = $label . '.' . $i;
        $node['children'][] = generateNode($childLabel, $depth - 1, $width, $counter);
    }

    return $node;
}

function renderTreeHtml($node) {
    $html = '<li>' . htmlspecialchars($node['id']) . ' (' . htmlspecialchars($node['label']) . ')';
    if (!empty($node['children'])) {
        $html .= "<ul>";
        foreach ($node['children'] as $child) {
            $html .= renderTreeHtml($child);
        }
        $html .= "</ul>";
    }
    $html .= '</li>';
    return $html;
}

$ref = isset($_GET['ref']) ? trim($_GET['ref']) : 'ME';
$depth = isset($_GET['depth']) ? intval($_GET['depth']) : 3;
$width = isset($_GET['width']) ? intval($_GET['width']) : 3;
if ($depth < 1) $depth = 1;
if ($width < 0) $width = 0;

$counter = 1;
$tree = generateNode($ref, $depth, $width, $counter);

header('Content-Type: text/html; charset=utf-8');
?>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Simulated Network - <?php echo htmlspecialchars($ref); ?></title>
<style>
    body { font-family: Arial, sans-serif; background:#f7f7f7; padding:20px }
    .container { max-width:1000px; margin:0 auto; background:white; padding:20px; border-radius:6px }
    ul { list-style-type: none; margin-left: 18px; padding-left: 12px; }
    li { margin:6px 0; }
    pre { background:#222; color:#dcdcdc; padding:12px; border-radius:4px; overflow:auto }
    .controls { margin-bottom:12px }
</style>
</head>
<body>
<div class="container">
    <h2>Simulated Network Tree</h2>
    <div class="controls">
        <strong>Ref:</strong> <?php echo htmlspecialchars($ref); ?>
        &nbsp;&nbsp; <strong>Depth:</strong> <?php echo $depth; ?>
        &nbsp;&nbsp; <strong>Width:</strong> <?php echo $width; ?>
    </div>

    <h3>Tree View</h3>
    <ul>
        <?php echo renderTreeHtml($tree); ?>
    </ul>

    <h3>JSON Output</h3>
    <pre><?php echo json_encode($tree, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES); ?></pre>

    <h4>Try another:</h4>
    <form method="get">
        <label>Ref: <input name="ref" value="<?php echo htmlspecialchars($ref); ?>"></label>
        &nbsp; <label>Depth: <input name="depth" value="<?php echo $depth; ?>" size="2"></label>
        &nbsp; <label>Width: <input name="width" value="<?php echo $width; ?>" size="2"></label>
        &nbsp; <button>Generate</button>
    </form>

    <p style="margin-top:18px;color:#666">Note: <em>Depth</em> is levels including the root. Width is number of children per node.</p>
</div>
</body>
</html>
