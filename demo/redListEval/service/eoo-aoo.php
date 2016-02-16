<?php
// 假裝已經讀出學名
$sciname = @$_REQUEST['n1'];
$oo_type = @$_REQUEST['oo_type'];
$oo_type = 'both';

// 假裝能上哪讀到raw data
$csv_data = "Lng	Lat
121.445726	25.213121
120.502372	23.2607
120.8653639	23.84350278
121.5597611	24.90344167
120.902721	24.585251
120.763327	24.018868
120.698303	23.967476
120.491343	23.474879
120.493638	23.476268
121.43789	23.75563
121.43485	23.7578
120.453466	23.289181
120.40119	23.218311
120.399497	23.22114
120.399497	23.22114
120.398472	23.223087
120.401716	23.225276
120.397322	23.231219
120.837218	24.060555";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://twebi.net:5566/oo_api.html");
curl_setopt($ch, CURLOPT_POST, true); // 啟用POST
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, array( "coordinates" => $csv_data, "oo_type" => $oo_type, "submit" => "not empty")); 
$res = curl_exec($ch); 
curl_close($ch);

echo $res;

?>
