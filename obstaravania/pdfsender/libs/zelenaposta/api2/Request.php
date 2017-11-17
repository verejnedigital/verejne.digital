<?php

namespace zelenaposta\api2;

use Phpro\SoapClient\Type\RequestInterface;

class Request implements RequestInterface
{
	public static function createObjectFromArray(array $data) {
		$object = new Request;
		foreach ($data as $key => $value) {
			if (is_array($value)) {
				$value = static::createObjectFromArray($value);
			}
			$object->{$key} = $value;
		}
		return $object;
	}
}