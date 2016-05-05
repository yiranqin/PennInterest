$(document).ready(function(){
	$("#loginform").on('submit', function(e) {
		e.preventDefault();
//		alert("hi");

	var loginuser = {
		login: $('#username').val(),
		pswd: $('#password').val(),
	};
//	alert(loginuser.login, loginuser.pswd);
	$.get('/login', loginuser, function(data) {
//		alert(data);
		if (!data){
			alert("Your username/password may not be entered correctly!");
		}
		else window.location.href = "/recommend";
	});
	});
});
