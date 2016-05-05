$(document).ready(function(){
	$("#resetform").on('submit', function(e) {
		e.preventDefault();
//		alert("hi");

	var loginuser = {
		login: $('#username').val(),
		oldpass: $('#password').val(),
		newpass: $('#newpassword').val()
	};
//	alert(loginuser.login, loginuser.pswd);
	$.get('/updatePasswords', loginuser, function(data) {
//		alert(data);
		if (!data){
			alert("Your username/password may not be entered correctly!");
		}
		else {
			alert("Success! Your password has been changed!");
			window.location.href = "/renderLogin";
		}
	});
	});
});
