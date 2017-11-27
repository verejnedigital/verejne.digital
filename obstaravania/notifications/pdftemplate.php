<?php

require ('vendor/autoload.php');

class pdfTemplate extends TCPDF {

	const MARGIN_LEFT = 10;
	const MARGIN_RIGHT = 10;
	const MARGIN_TOP = 25;
	const MARGIN_BOTTOM = 15;

	const LOGO_PATH = 'resources/SKico.png';

	const TEMPLATE_DIR = 'templates/';
	const TEMPLATE_COMPILE = 'templates/compiled';
	const TEMPLATE_CACHE = 'templates/cache';

	const HEADER_TPL = 'header.tpl';
	const FOOTER_TPL = 'footer.tpl';
	const BODY_TPL = 'body.tpl';

	private $data = null;

	//caching
	//NOTE: do it in another way in case we use some local context info, like date/time, to make that infos up-to-date.
	private $output = null;
	private $smarty = null;

	public function setData($data) {
		$this->data = $data;
		$this->output = null;
	}

	//Page header
	public function Header() {
		//botom line
		$x = $this->GetX();
		$y = $this->GetY();
		$this->SetLineStyle(array('width' => 0.85 / $this->k, 'cap' => 'butt', 'join' => 'miter', 'dash' => 0));
		$this->SetX($this->original_rMargin);
		$this->SetY(20);
		$this->Cell(($this->w - $this->original_lMargin - $this->original_rMargin), 0, '', 'T', 0, 'C');
		$this->SetX($x);
		$this->SetY($y);

		// Logo
		$image_file = self::LOGO_PATH;
		$this->Image($image_file, 10, 10, 25, '', 'PNG', '', 'T', false, 300, '', false, false, 0, false, false, false);
		//TODO: font
		// Set font
		$this->SetFont('helvetica', 'B', 12);
		$this->SetTextColor(255,255,255,255);
		$x = $this->GetX() + 2;
		$this->SetY(15);
		$this->SetX($x);
		$this->Cell(15, 135, 'verejne', 0, false, '', 0, '', 0, false, 'M', 'M');
		$this->SetFont('helvetica', '');
		$this->Cell(20, 135, '.digital', 0, false, '', 0, '', 0, false, 'M', 'M');
		$this->Cell(0, 135, date('j.n.Y'), 0, false, 'R', 0, '', 0, false, 'M', 'M');
		/*$this->SetY(15);
		$html = $this->smarty->fetch('header.tpl');
		$this->writeHTML($html, true, false, true, false, '');*/
	}

	// Page footer
	public function Footer() {
		$this->SetY(-15);
		$html = $this->smarty->fetch('footer.tpl');
		$this->writeHTML($html, true, false, true, false, '');
	}

	public function createDocument() {
		if ($this->smarty === null) {
			Smarty::muteExpectedErrors();
			$this->smarty = new Smarty();
			$this->smarty->setTemplateDir(self::TEMPLATE_DIR);
			$this->smarty->setCompileDir(self::TEMPLATE_COMPILE);
			$this->smarty->setCacheDir(self::TEMPLATE_CACHE);
			$this->smarty->registerPlugin("function", "prettyfyPrice", [$this, "prettyfyPrice"]);
			$this->smarty->assign('date', date('j.n.Y'));
			$this->smarty->assign('pages', $this->getAliasNbPages());
			$this->smarty->assign('currentPage', $this->getAliasNumPage());
		}

		if ($this->output === null && $this->data !== null) {
			$this->smarty->assign('linkMore', $this->getLinkMore($this->data));
			$this->smarty->assign('companyName', $this->data['company']['name']);

			// set document metadata information
			$this->createMeta();
			//Do not add link to TCPDF at bottom.
			$this->tcpdflink = false;

			// remove default header/footer
			$this->setPrintHeader(true);
			$this->setPrintFooter(true);

			// set margins
			$this->SetHeaderMargin(PDF_MARGIN_HEADER);
			$this->SetFooterMargin(PDF_MARGIN_FOOTER);
			$this->SetMargins(self::MARGIN_LEFT, self::MARGIN_TOP, self::MARGIN_RIGHT, true);
			// set auto page breaks
			$this->SetAutoPageBreak(TRUE, self::MARGIN_BOTTOM);

			// set default monospaced font
			$this->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);

			// set image scale factor
			$this->setImageScale(PDF_IMAGE_SCALE_RATIO);
			//$vspaces = ['p' => [0 => ['h' => 0, 'n' => 0], 1 => ['h' => 0, 'n' => 0]]];
			//$this->setHtmlVSpace($vspaces);

			//First page
			$this->AddPage();

			$html = $this->createDocumentBody($this->data);
			$this->writeHTML($html, true, false, true, false, '');

			$this->output = $this->Output('test.pdf', 'S');
		}
		
		return $this->output;
	}

	protected function getLinkMore($data) {
		//TODO: parametrize poradie in link
		return 'https://www.uvo.gov.sk/evestnik?poradie=202&year=' . date('Y');
	}

	protected function createMeta() {
			//TODO: use constants from somewhere
			$this->SetCreator('verejne.digital pdfmaker');
			$this->SetAuthor('Martin Rejda');
			$this->SetTitle('Ponuka verejných zakázok ku ' . date('j.n.Y'));
			$this->SetSubject('Ponuka verejných zakázok');
			//Make sure ;)
			$this->SetKeywords('ponuka, verejne obstaravanie, verejne.digital, zlodejina');
	}

	protected function createDocumentBody($json_data) {
		$this->smarty->assign('data', $json_data);
		return $this->smarty->fetch('body.tpl');
	}

	public function prettyfyPrice($price, $smarty) {
		$res = number_format($price['price'], 2, ',', ' ') . ' €';
		return $res;
	}
}

?>