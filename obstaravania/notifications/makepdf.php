<?php
if ($argc < 3) {
	fwrite(STDERR, "Usage: php makepdf.php <input file> <output pdf>, where input file is json, Output is PDF.\n
Return 0 on success, 1 on error, 2 on temporary error.");
	exit(1);
}

$data = file_get_contents($argv[1]);
if ($data === false) {
	fwrite(STDERR, "Unable to read input file.\n");
	exit(1);
}

$json = json_decode($data, true);
if ($json === null) {
	fwrite(STDERR, "Unable to decode input file to json.\n");
	exit(1);
}

if (file_exists($argv[2])) {
	fwrite(STDERR, sprintf("%s already exists.\n", $argv[2]));
	exit(2);
}

function groupBySource($data) {
	//1. here we group all offers under one-same reason
	//2. every offer is produced only once
	$used_offer = []; // list of offer keys
	$res = [];	//key - reason ID, value - array('reason' => reason, offers => array(offers))
	foreach ($data['notifications'] as $offer) {
		//add reason if not already added.
		if (!array_key_exists($offer['reason']['id'], $res)) {
			$res[$offer['reason']['id']] = [
				'reason' => $offer['reason'],
				'offers' => []
			];
		};
		//add offer under reason, if not already added
		if (!array_key_exists($offer['what']['id'], $used_offer)) {
			$used_offer[$offer['what']['id']] = $offer['what']['id'];
			$res[$offer['reason']['id']]['offers'][] = $offer['what'];
		}
	}
	$data['notifications'] = $res;
	return $data;
}

function filterData($data) {
	//remove price if it's 0
	foreach ($data['notifications'] as $key => $offer) {

		if ($offer['reason']['price'] == 0) {
			unset($data['notifications']['reason']['price']);
		}

		if ($offer['what']['price'] == 0) {
			unset($data['notifications']['what']['price']);
		}
	}
	
	return $data;
}

$start = microtime(true);

$filteredData = filterData($json);
$groupedData = groupBySource($filteredData);
//var_dump($groupedData);die();

require ('pdftemplate.php');
$pdfTemplate = new \pdfTemplate();
$pdfTemplate->setData($groupedData);

try {
	$pdfData = $pdfTemplate->createDocument();
	if ($pdfData === null) {
		throw new Exception("Unable to render PDF.");
	}
	$res = file_put_contents($argv[2], $pdfData);
	//Maybe check error details to classify whether it's temporary (like no free space) or finite error (no permissions).
	if ($res === false) {
		throw new Exception("Save PDF file failed.");
	}
} catch (Exception $e) {
	fwrite(STDERR, sprintf("Failed to create PDF. Reason: %s\n", $e->getMessage()));
	exit(1);
}

$end = microtime(true);
fwrite(STDERR, sprintf("%fms to generate PDF (%s)\n", ($end - $start), $argv[2]));
exit(0);

?>
