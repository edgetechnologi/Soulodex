<?php 
header('content-type: application/json; charset=utf-8');

if (isset($_POST["street"])) {
	
	$street = ($_POST['street']);
	$city = ($_POST['city']);
	$state = ($_POST['state']);
	$zip = ($_POST['zip']);
	//$businessName = ($_POST['businessName']);
//	$pointOfContact = ($_POST['contactName']);
//	$businessPhone = ($_POST['phoneNumber']);
//	$channelSelection = ($_POST['channelSelection']);
//	$businessEmail = ($_Post["businessEmail"]);
//	$businessWebsite = ($_Post["businessWebsite"]);
//	$businessFax = ($_Post["businessFax"]);
//	$businessDescription = ($_POST["businessDescription"]);
//
//	$ip = $_SERVER['REMOTE_ADDR']; 
//	$httpref = $_SERVER['HTTP_REFERER']; 
//	$httpagent = $_SERVER['HTTP_USER_AGENT']; 
	//$today = date("F j, Y, g:i a");    

	// 'POST':
		//curl_setopt($handle, CURLOPT_POST, true);
	//	curl_setopt($handle, CURLOPT_POST, count($data));
//		curl_setopt($handle, CURLOPT_POSTFIELDS, $data);
//		break;
//	 
//	
// 	$handle = curl_init();
// 	curl_setopt($handle, CURLOPT_URL, $url);
// 	if($headers !=="" || $headers !== null)
// 	curl_setopt($handle, CURLOPT_HTTPHEADER, $headers);
// 	curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
// 	curl_setopt($handle, CURLOPT_SSL_VERIFYHOST, false);
// 	curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);
// 	
// 	$response = curl_exec($handle);
// 	$code = curl_getinfo($handle, CURLINFO_HTTP_CODE);
// 
// 	$arrResponse = array($response,$code);
// 	return $arrResponse;

	$opts = array( 
        'http' => array( 
            'method'=>"GET", 
        ) 
    ); 

    $context = stream_context_create($opts); 
	
	$queryStr = str_replace(" ", "%20", "streetAddress=$street&city=$city&state=$state&zip=$zip&apiKey=d9cf718cbf4d49b8a3c10f21bb2cbfbc&version=4.01");
	$url = "http://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx?$queryStr";
	$response =  explode(',' , file_get_contents($url));
	$geoCoder = new ArrayObject();

if($response !== false){
	$geoCoder["Latitude"] = $response[3];
	$geoCoder["Longitude"] = $response[4];
} else {
	$geoCoder["response"] = $response;
	$geoCoder["error"] = "There was a problem geocoding the address provided";
	}
	echo json_encode($geoCoder);
} else {
	$geoCoder["response"] = "false";
	$geoCoder["error"] = "Quailifying address not supplied";

	echo json_encode($geoCoder);
	
}

//
?>