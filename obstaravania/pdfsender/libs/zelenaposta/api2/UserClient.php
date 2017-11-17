<?php

namespace zelenaposta\api2;

use Phpro\SoapClient\Client;
use Phpro\SoapClient\Type\RequestInterface;
use Phpro\SoapClient\Type\ResultInterface;

/**
 *
 */
class UserClient extends Client
{
    /**
     * @param RequestInterface $request
     *
     * @return ResultInterface
     * @throws \Phpro\SoapClient\Exception\SoapException
     */
    public function getInfo(RequestInterface $request)
    {
        return $this->call('getInfo', $request);
    }
}