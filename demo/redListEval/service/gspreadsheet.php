<?php

$var_col = 0;
$data_start_col = 1;

$fp = fopen($_GET['q'], 'r');
$lines = array();

while ($data = fgetcsv($fp, 0, "\t")) {
	for ($i=$data_start_col; $i<count($data); $i++) {
		$coldata[$i][$data[$var_col]] = $data[$i];
	}
}

echo json_encode($coldata);

fclose($fp);
?>
