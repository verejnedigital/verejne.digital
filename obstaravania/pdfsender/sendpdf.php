<?php
require ('vendor/autoload.php');

$arguments = new \Commando\Command();
$arguments->option('u')
	->aka('username')
	->describedAs('Username used in remote service call.')
	->require();

$arguments->option('p')
	->aka('password')
	->describedAs('Password used in remote service call.')
	->require();

$arguments->option()
	->file()
	->describedAs('Input json file.')
	->require();

$arguments->option()
	->file()
	->describedAs('Input pdf file.')
	->require();

$start = microtime(true);

$ext1 = substr($arguments[0], -4);
$ext2 = substr($arguments[1], -4);
$jsonFile = '';
$pdfFile = '';
if ($ext1 == '.pdf' && $ext2 == 'json') {
	$jsonFile = $arguments[1];
	$pdfFile = $arguments[0];
} else if ($ext1 == 'json' && $ext2 == '.pdf') {
	$jsonFile = $arguments[0];
	$pdfFile = $arguments[1];
} else {
	fwrite(STDERR, sprintf("Input files %s, %s are not json and pdf.\n", $arguments[0], $arguments[1]));
	exit(1);
}

$jsonData = file_get_contents($jsonFile);
if ($jsonData === null) {
	fwrite(STDERR, sprintf("Cannot read input json file %s.\n", $jsonFile));
	exit(1);
}
$json = json_decode($jsonData, true);
if ($json === null) {
	fwrite(STDERR, sprintf("Unable to decode input json %s.\n", $jsonFile));
	exit(1);
}

$pdf = file_get_contents($pdfFile);
if ($pdf === null) {
	fwrite(STDERR, sprintf("Cannot read input pdf file %s.\n", $pdfFile));
	exit(1);
}

$exitCode = 0;
try {
	$zelenaPosta = new \ZelenaPosta($arguments['u'], $arguments['p']);
	$zelenaPosta->setJson($json);
	$zelenaPosta->setPdf($pdf);

	$result = $zelenaPosta->sendFiles();
} catch(RetryableException $e) {
	fwrite(STDERR, sprintf("Error: %s.\n", $e->getMessage()));
	fwrite(STDERR, "Failed to send PDF file. Please try again later.\n");
	$exitCode = 1;
} catch (Exception $e) {
	fwrite(STDERR, sprintf("Error: %s.\n", $e->getMessage()));
	fwrite(STDERR, "Failed to send PDF file.\n");
	$exitCode = 2;
}

$end = microtime(true);
fwrite(STDERR, sprintf("%fms to send PDF file.\n", ($end - $start)));
exit($exitCode);
