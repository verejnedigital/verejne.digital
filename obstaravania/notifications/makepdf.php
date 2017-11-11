<?php
if ($argc < 2) {
	echo 'Usage: php makepdf.php <input file>, where input file is json. Output will be put into "out" directory.';
	exit(1);
}

$data = file_get_contents($argv[1]);
if ($data === false) {
	echo 'Unable to read input file.';
	exit(1);
}

$json = json_decode($data, true);
if ($json === null) {
	echo 'Unable to decode input file to json.';
	exit(1);
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

$baseFileName = sprintf('%s_%s', date('Ymd-His'), $groupedData['company']['ico']);
is_dir('out') || mkdir('out');
if (!is_file('out/'.$baseFileName.'.pdf')) {
	file_put_contents('out/'.$baseFileName.'.pdf', $pdfTemplate->createDocument());
	file_put_contents('out/'.$baseFileName.'.json', $data);
	$end = microtime(true);
	echo sprintf("%fms to generate PDF (%s{.json, .pdf})\n", ($end - $start), 'out/' . $baseFileName);
} else {
	$end = microtime(true);
	echo sprintf("%s{.json, .pdf} already exists, skipping...\n", ($end - $start), 'out/' . $baseFileName);
}

?>
