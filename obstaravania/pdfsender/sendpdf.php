<?php
if ($argc < 3) {
	echo "Usage: php sendpdf.php <input json> <input pdf> or vice-versa.\n";
	exit(1);
}

require ('vendor/autoload.php');

$start = microtime(true);

$ext1 = substr($argv[1], -4);
$ext2 = substr($argv[2], -4);
$jsonFile = '';
$pdfFile = '';
if ($ext1 == '.pdf' && $ext2 == 'json') {
	$jsonFile = $argv[2];
	$pdfFile = $argv[1];
} else if ($ext1 == 'json' && $ext2 == '.pdf') {
	$jsonFile = $argv[1];
	$pdfFile = $argv[2];
} else {
	echo sprintf("Input files %s, %s are not json and pdf.\n", $argv[1], $argv[2]);
	exit(1);
}

$jsonData = file_get_contents($jsonFile);
if ($jsonData === null) {
	echo sprintf("Cannot read input json file %s.\n", $jsonFile);
	exit(1);
}
$json = json_decode($jsonData, true);
if ($json === null) {
	echo sprintf("Unable to decode input json %s.\n", $jsonFile);
	exit(1);
}

$pdf = file_get_contents($pdfFile);
if ($pdf === null) {
	echo sprintf("Cannot read input pdf file %s.\n", $pdfFile);
	exit(1);
}

$zelenaPosta = new \ZelenaPosta();
$zelenaPosta->setJson($json);
$zelenaPosta->setPdf($pdf);
$result = $zelenaPosta->sendFiles();

$end = microtime(true);
if ($result) {
	echo sprintf("%fms to send PDF file.\n", ($end - $start));
	exit(0);
} else {
	echo sprintf("Failed to send PDF file.\n");
	exit(1);
}
