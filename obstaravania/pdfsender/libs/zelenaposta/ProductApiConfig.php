<?php
// This is config file used to generate classes (request, response) for SOAP calls to ZelenaPosta webservice.
// to generate classes run: vendor/bin/soap-client generate:types --config libs/zelenaposta/ProductApiConfig.php
// to generate class map run: vendor/bin/soap-client generate:classmap --config libs/zelenaposta/ProductApiConfig.php > libs/zelenaposta/ProductClassMap.php
// for now, we don't use it, because resulted classes are not OK. Ex. class mailing.

require ('vendor/autoload.php');

use Phpro\SoapClient\CodeGenerator\Config\Config;
use Phpro\SoapClient\CodeGenerator\Rules;
use Phpro\SoapClient\CodeGenerator\Assembler;

$res = Config::create()
    ->setWsdl('https://gateway.zelenaposta.sk/api/2/product?wsdl')
    ->setDestination('libs/zelenaposta/api2/product')
    ->setNamespace('zelenaposta\api2\product')
    ->addSoapOption('features', SOAP_SINGLE_ELEMENT_ARRAYS)
    ->addRule(new Rules\AssembleRule(new Assembler\GetterAssembler()))
    ->addRule(new Rules\AssembleRule(new Assembler\SetterAssembler()))
    ->addRule(new Rules\TypenameMatchesRule(
        new Rules\AssembleRule(new Assembler\RequestAssembler()),
        '/Request$/'
    ))
    ->addRule(new Rules\TypenameMatchesRule(
        new Rules\AssembleRule(new Assembler\ResultAssembler()),
        '/Response$/'
    ))
;

return $res;