<?php 
header('content-type: application/json; charset=utf-8');

if (isset($_POST["businessName"])) {
	$businessName = strip_tags($_POST['businessName']);
	$pointOfContact = strip_tags($_POST['pointofContact']);
	$businessPhone = strip_tags($_POST['businessPhone']);
	$street = strip_tags($_POST['street']);
	$unit = strip_tags($_POST['unit']);
	$city = strip_tags($_POST['city']);
	$state = strip_tags($_POST['state']);
	$zip = strip_tags($_POST['zip']);
	$channelSelection = strip_tags($_POST['channelSelection']);
	$businessEmail = strip_tags($_Post["businessEmail"]);
	$businessWebsite = strip_tags($_Post["businessWebsite"]);
	$businessFax = strip_tags($_Post["businessFax"]);
	$businessDescription = strip_tags($_POST["businessDescription"]);

	$ip = $_SERVER['REMOTE_ADDR']; 
	$httpref = $_SERVER['HTTP_REFERER']; 
	$httpagent = $_SERVER['HTTP_USER_AGENT']; 
	$today = date("F j, Y, g:i a");    

	$result = 'success';

	if ($result) {
		echo json_encode($result);
	}
}
?>