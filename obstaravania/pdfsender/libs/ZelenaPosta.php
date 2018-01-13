<?php

use Phpro\SoapClient\ClientBuilder;
use Phpro\SoapClient\ClientFactory;
use zelenaposta\api2\SentClient;
use zelenaposta\api2\Auth;

/**
* 
*/
class ZelenaPosta
{

	CONST WSDL_USER = 'https://gateway.zelenaposta.sk/api/2/user?wsdl';
	CONST WSDL_SENT = 'https://gateway.zelenaposta.sk/api/2/sent?wsdl';
	//localhost testing
	//CONST WSDL_SENT = 'http://localhost:8081/api/2/sent?wsdl';
	CONST SENDER_NAME = 'OZ Chcemvediet.sk';
	CONST SENDER_STREET = 'Karpatska 10A';
	CONST SENDER_CITY = 'Bratislava';
	CONST SENDER_ZIP = '83106';
	CONST SENDER_COUNTRY = 'Slovensko';

	private $pdf = null;
	private $json = null;
	/** @var SentClient $client */
	private $client = null;

	function __construct(string $username, string $password)
	{
		//$clientFactory = new ClientFactory(UserClient::class);
		$clientFactory = new ClientFactory(\zelenaposta\api2\SentClient::class);

		$soapOptions = [
			'cache_wsdl' => WSDL_CACHE_DISK
		];
		$clientBuilder = new ClientBuilder($clientFactory, self::WSDL_SENT, $soapOptions);
		$clientBuilder->withHandler(\Phpro\SoapClient\Soap\Handler\GuzzleHandle::createWithDefaultClient());

		$wsse = new Auth();
		$wsse->setUsernameAndPassword($username, $password);
		//Not working yet
		//$wsse->setToken(self::USERNAME, self::TOKEN);

		//$clientBuilder->withLogger(new Logger());
		//$clientBuilder->withEventDispatcher(new EventDispatcher());
		$clientBuilder->addMiddleware($wsse);
		//$clientBuilder->withClassMaps(require('zelenaposta/UserClassMap.php'));
		//$clientBuilder->addTypeConverter(new DateTimeTypeConverter());
		$this->client = $clientBuilder->build();
	}

	public function setPdf($pdf)
	{
		$this->pdf = $pdf;
	}

	public function setJson($json)
	{
		$this->json = $json;
	}

	public function sendFiles()
	{
		$req = \zelenaposta\api2\Request::createObjectFromArray(
			$this->createRequest()
		);
		//var_dump($req);
		try {
			/** @var \Phpro\SoapClient\Type\MixedResult $response */
			$response = $this->client->sendMailings($req);
			$result = $response->getResult();
			echo sprintf("New mailing created as slotId %s for %s€.\n", $result->slotId, $result->totalPrice);
		} catch (\Phpro\SoapClient\Exception\SoapException $e) {
			$exc = $e->getPrevious();
			if ($exc instanceof \GuzzleHttp\Exception\ServerException) {
				/** @var \GuzzleHttp\Exception\ServerException $exc */
				/** @var \GuzzleHttp\Psr7\Request $origRequest */
				$origRequest = $exc->getRequest();
				echo sprintf("Request to %s.\n%s\n", $exc->getRequest()->getUri(), $origRequest->getBody());
				echo sprintf("Response code %s, message: %s.\n", $exc->getCode(), $exc->getMessage());
				if ($exc->hasResponse()) {
					$body = $exc->getResponse()->getBody();
					//TODO: parse body for details
					echo sprintf("Content: %s\n", $body->getContents());
				}
			}
			return false;
		}

		return true;
	}

	protected function createRequest() {
		//for structure see. https://www.zelenaposta.sk/page/api-sent
		$res = [
			'title' => sprintf('%s, %s, %s',
				$this->json['company']['name'],
				$this->json['company']['ico'],
				date('Y-m-d')),
			'mailings' => [
				'mailing' => [
					'uiz1' => $this->json['company']['ico'],
					'customId' => sprintf('%s_%s',
						$this->json['company']['ico'],
						date('Y-m-d')),
					'duplex' => true,
					'printing' => 'blackWhite',
					'correspondence' => '2ndClass',
					'documents' => [
						'document' => [
							'file' => $this->pdf    //library do base64 encode for us
						]
					],
					'recipient' => [
						'name' => $this->json['company']['name'],
						'street' => $this->json['company']['street'],
						'city' => $this->json['company']['city'],
						'zip' => $this->json['company']['zip'],
						'country' => $this->json['company']['country']
					],
					'sender' => [
						'name' => self::SENDER_NAME,
						'street' => self::SENDER_STREET,
						'city' => self::SENDER_CITY,
						'zip' => self::SENDER_ZIP,
						'country' => self::SENDER_COUNTRY
					]
				]
			]
		];

		return $res;
	}
}
