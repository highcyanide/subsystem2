<?php
$zip = new ZipArchive();
if ($zip->open(__DIR__ . '/../docs/template-inventory.xlsx') === true) {
    $strings = [];
    if (($strXml = $zip->getFromName('xl/sharedStrings.xml')) !== false) {
        $xml = simplexml_load_string($strXml);
        foreach ($xml->si as $si) {
            $strings[] = (string)($si->t ?? $si->r->t ?? '');
        }
    }
    
    echo "SHARED STRINGS (" . count($strings) . "):\n";
    foreach ($strings as $idx => $str) {
        echo "[$idx] $str\n";
    }

    if (($sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml')) !== false) {
        $xml = simplexml_load_string($sheetXml);
        echo "\nTOTAL ROWS: " . count($xml->sheetData->row) . "\n";
        $allRows = $xml->sheetData->row;
        $total = count($allRows);
        for ($i = max(0, $total - 8); $i < $total; $i++) {
            $row = $allRows[$i];
            $cells = [];
            foreach ($row->c as $cell) {
                $val = (string)$cell->v;
                if ((string)$cell['t'] === 's' && isset($strings[(int)$val])) {
                    $val = $strings[(int)$val];
                }
                $f = (string)($cell->f ?? '');
                $cells[] = (string)$cell['r'] . ': ' . ($f ? "f($f)=" : '') . $val;
            }
            echo "Row " . (string)$row['r'] . ": " . implode(' | ', $cells) . "\n";
        }
    }
    $zip->close();
} else {
    echo "Could not open xlsx\n";
}
