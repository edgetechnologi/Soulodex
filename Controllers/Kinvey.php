<?
include('../Models/Channels.php');
class Kinvey {
	//Production
	private $key = ($_SERVER['HTTP_HOST'] == "soulodex.us") ? "kid_PTM0tk_9T9" : "kid_Ve-Km89ZF";  
	private $masterSecret = ($_SERVER['HTTP_HOST'] == "soulodex.us") ? "f8199fde17064f88ad293aaae29f7e13" : "f94128203a694d1aa7c94c3800d7cb3a";

	private $headers = array();

	private $AUTH = base64_encode("$key:$masterSecret"); //basic authentication
	private $kinveyURL = "https://baas.kinvey.com/";
	private $headers = array(
				"Content-Type: application/json",
				"Host: $host",
				"Authorization: Basic ".$AUTH
				//"Pragma: no-cache",
				//"Connection: close"
			);
//Login function
//@Description : Login method for preparing the request to authenticate user
//@$user an object that includes username and password			
public function login($user){
	$tbl = "user";
	$method = "POST";
	$url = "$kinveyURL/$tbl/$key/_me";
	$param = $user;
}

public function getChannels (){
			$tbl = "channels";

			$url = "appdata/$kinveyURL/$key/$tbl";
			$method = "GET";
			
			try{
				$res = requestKinvey($url,$headers,$method,$data);
			} catch ( Exception $e ){
				var_dump($e->getMessage());
			}
			
			echo $res[0];
}
//Kinvey Request 	
private function requestKinvey($url,$headers,$method,$data)
 {
	 switch($method){
		case 'GET':
		break;
	
		case 'POST':
		//curl_setopt($handle, CURLOPT_POST, true);
		curl_setopt($handle, CURLOPT_POST, count($data));
		curl_setopt($handle, CURLOPT_POSTFIELDS, $data);
		break;
	 }
	
 	$handle = curl_init();
 	curl_setopt($handle, CURLOPT_URL, $url);
 	if($headers !=="" || $headers !== null)
 	curl_setopt($handle, CURLOPT_HTTPHEADER, $headers);
 	curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
 	curl_setopt($handle, CURLOPT_SSL_VERIFYHOST, false);
 	curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);
 	
 	$response = curl_exec($handle);
 	$code = curl_getinfo($handle, CURLINFO_HTTP_CODE);
 
 	$arrResponse = array($response,$code);
 	return $arrResponse;
 	
 	}
}
?>

