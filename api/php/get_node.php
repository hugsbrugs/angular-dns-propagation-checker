<?php

try
{
	// error_log($_GET['url']);
	echo file_get_contents(trim($_GET['url']));
}
catch(CURLRequestException $e)
{
	echo json_encode(array(
		'code' => $e->getCode(),
		'message' => $e->__toString()
	));
}