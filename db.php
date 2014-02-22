 <?
 include 'sessionController.php';
/************************************
File: db.php
Created by: Crystal Smith
Date: 10/18/2013

Connection to Kinvey backend
Restful API methods
Login, Logout

*************************************/
 $Enviornment_APPKEY = "kid_Ve-Km89ZF";
 $Enviornment_APPSECRET = "cd116b36b3a741b78f26a8065ac39821";

 $AuthorizationString = base64_encode("$Enviornment_APPKEY:$Enviornment_APPSECRET");
 $HostString = "https://baas.kinvey.com"; //host 
 $KinveyVersion = "2";
 $collection = "";
 $operation = (isset($_POST["operation"])) ? $_POST["operation"] : "";
 $username = (isset($_POST["username"])) ? $_POST["username"] : "";
 $password = (isset($_POST["password"])) ? $_POST["password"] : "";
 $method = "";
  
 //Constants
 define('APPKEY', $Enviornment_APPKEY);
 define('APPSECRET', $Enviornment_APPSECRET);
 define('MASTERSECRET', $Enviornment_MASTERSECRET);
 //define('AUTHORIZATION', "Basic $AuthorizationString"); 
 define('HOST', $HostString); 
 define('KINVEYVERSION', $KinveyVersion);
 
 //js implementation
 //$.post("db.php",{ 
//		"operation": "init"
//		}).done(function( data ) {
//			if(data){
//				res = $.parseJSON(data);
//				console.log("php init");
//				console.log(res)
//				if(res.success)
//					var KinveyOnline = res.success;
//				} else if(res.error){
//					doc.trigger('error', res.description);
//				console.log(res.error);
//
//			}
//			console.log(KinveyOnline);
//		}).fail(function(error) {
//			doc.trigger('error', error);
//  		}).always(function() {
//	//	 	button.removeClass('ui-disabled');
//      		$.mobile.initializePage();// Render page.
//	});
      

 //Error
 function errorMsg($msg){
	//$error = new ArrayObject();
	//$error = $msg;
	 
	 echo json_encode($msg);
 }
 
 
 //init Kinvey
 //POST /user/:appKey/
 function initKinvey(){
	 $operation = "init";
	 $user =  array("username" => "Guest", "password" => "12345");

	$url = HOST ."/appdata/". APPKEY."/";

	$responseObj = kinveyRequest("GET",$user,$url,$operation);
	
	if($responseObj["code"] >= 400)
	{
    	errorMsg($responseObj["response"]);
	} else {
		echo json_encode($responseObj);	
	}
 }
 
 
//login
//POST /user/:appKey/login
function loginUser($user, $pass){
 $collection = "user";
 $operation = "login";
 $user = array("username" => "Guest", "password" => "12345");//Defaults to guest user for now
 $username = $user["username"];
 
	$url = HOST ."/".$collection."/". APPKEY ."/".$operation;

	$userObj = kinveyRequest("POST", $user, $url,$operation);
	if($userObj["code"] >= 400)
	{
  		errorMsg($userObj["response"]);
	} else {
	
		$userInfo = $userObj["response"];
		
		//echo "UserInfo: ". json_encode($userObj["response"]) . "<br />";
		//$_SESSION['uid'] = $uid;
		//$_SESSION['pwd'] = $pwd;
		
		$jsonIterator = new RecursiveIteratorIterator(
		new RecursiveArrayIterator(json_decode($userInfo, TRUE)),
		RecursiveIteratorIterator::SELF_FIRST);
	
		foreach ($jsonIterator as $key => $val) {
			
			if($key == "username"){
			$username = $val;
			}
			if(is_array($val)) {
			   // echo "$key:<br />";
			} else {
			   // echo "$key => $val<br />";
				$_SESSION[$username][$key] = $val;
			}
		}
		 //echo "Session: <br />";
		foreach($_SESSION[$username] as $key => $val){
			//echo "[$username] $key => $val <br />";	
		}
		
		echo json_encode($userObj);
		}
}
//Logout
function logOutUser($username, $pass){
	 $collection = "user";
	 $operation = "_logout";
	 $user =  new ArrayObject();
	 $user["username"] = $username;
	 $user["password"] = $pass;
	 
	$url = HOST ."/".$collection."/". APPKEY ."/".$operation;

	$userObj = kinveyRequest("POST", $user, $url,$operation);
	
	if($userObj["code"] >= 400)
	{
		errorMsg(array("Error" => $userObj["response"]));
	} else {
		
		echo  json_encode($userObj);
	}	
	
	//Destroy session
	if(isset($_SESSION[$username])){
		unset($_SESSION[$username]);
	}
	
	$_SESSION = array();
	session_destroy();
}

//getChannels
//GET /appdata/:appKey/:collectionName/?query=[filters]&[modifiers]
function getChannels(){
 $collection = "channels";
 $operation = 'query={}&fields=channelName&sort={"channelName": 1}';
 
	$url = HOST ."/appdata/".APPKEY ."/".$collection."?".$operation;

	$channels = kinveyRequest("GET", $user, $url,$operation);
	if($channels["code"] >= 400)
	{
    	errorMsg(array($channels["response"]));
	}
	
	$channelList = $channels["response"];
	//echo $channelList;
}

//Kinvey RestAPI Request
function kinveyRequest($method, $data, $serviceUrl, $operation){
	$curl = curl_init($serviceUrl);
	$authString = (isset($_SESSION[$data['username']]["authtoken"])) ? "Kinvey ".$_SESSION[$data['username']]["authtoken"] : "Basic ".base64_encode($data['username'].":".$data['password']);
	$headers = array(
		"Content-Type: application/json",
		"X-Kinvey-Api-Version: ".KINVEYVERSION,
		"Authorization: $authString"
		);	


	if($method == "POST"){
		curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");                                                          				
		curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));	
		curl_setopt($curl, CURLOPT_USERPWD, $data['username'].":".$data['password']);	
	} 

	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

	$response = curl_exec($curl);
	
	if($response === false){
    	errorMsg(curl_error($curl));
	}

	$code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
	$arrResponse = array();
	if($code == 200){
		$arrResponse = array("success" => true);
	} else {
		$arrResponse = array("success" => false);
	}
	$arrResponse["response"] = $response;
	$arrResponse["code"] = $code;

	return $arrResponse;
}
		//Create an active user -- Required by Kinvey before sending request
	 	loginUser($username, $password);
	
	
 
?>