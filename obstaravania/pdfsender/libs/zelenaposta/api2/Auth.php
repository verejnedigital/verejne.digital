<?php

namespace zelenaposta\api2;

use GuzzleHttp\Promise\PromiseInterface;
use Phpro\SoapClient\Middleware\Middleware;
use Phpro\SoapClient\Xml\SoapXml;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

class Auth extends MiddleWare
{
    private $username = null;
    private $password = null;
    private $token = null;

    public function getName(): string
    {
        return 'zelena_posta_auth';
    }

    /**
     * @param callable         $handler
     * @param RequestInterface $request
     * @param array            $options
     *
     * @return PromiseInterface
     */
    public function beforeRequest(callable $handler, \Psr\Http\Message\RequestInterface $request, array $options)
    {
        /** @var SoapXml $xml */
        $xml = SoapXml::fromStream($request->getBody());
        $doc = $xml->getXmlDocument();
        $header = $xml->createSoapHeader();
        $security = $doc->createElementNS('http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd', 'Security');
        $usernameToken = $doc->createElement('UsernameToken');
        $username = $doc->createElement('Username', $this->username);
        if ($this->token === null) {
            $pass = $doc->createElement('Password', $this->password);
            $pass->setAttribute('Type', 'wsse:PasswordText');
        } else {
            $pass = $doc->createElement('Password', $this->token);
            $pass->setAttribute('Type', 'zp:AuthToken');
        }
        $usernameToken->appendChild($username);
        $usernameToken->appendChild($pass);
        $security->appendChild($usernameToken);
        $header->appendChild($security);

        $xml->prependSoapHeader($header);
        $request = $request->withBody($xml->toStream());
        //var_dump($xml->toString());
        return $handler($request, $options);
    }

    /**
     * @param \Psr\Http\Message\ResponseInterface $response
     * @return ResponseInterface
     */
    public function afterResponse(\Psr\Http\Message\ResponseInterface $response)
    {
        return $response;
    }

    public function setUsernameAndPassword(string $username, string $password)
    {
        $this->username = $username;
        $this->password = $password;
        $this->token = null;
    }

    public function setToken(string $username, string $token)
    {
        $this->username = $username;
        $this->token = $token;
        $this->password = null;
    }
}