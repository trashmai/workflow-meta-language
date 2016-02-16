<?php

$stime = microtime(true);

$r = rand(1,1);
sleep($r);

echo microtime(true) - $stime;
echo "\n";
?>
