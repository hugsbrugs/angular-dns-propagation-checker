<?php

try
{
	echo file_get_contents('http://www.dns-lg.com/nodes.json');
}
catch(CURLRequestException $e)
{
	echo json_encode(array(
		'code' => $e->getCode(),
		'message' => $e->__toString()
	));
}