<?

//session_start();

$uid = isset($_POST['username']) ? $_POST['username'] : $_SESSION['username'];
$pwd = isset($_POST['password']) ? $_POST['password'] : $_SESSION['password'];


if(!$uid){
	//header("Location: http://soulodex.net/app/app.html#login");	
}
?>