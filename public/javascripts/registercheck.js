$(document).ready(function(){
	$("#contactform").on('submit', function(e) {
		e.preventDefault();
//		alert("hi");
		
	if ($('#password').val() != $('#repassword').val()) {
		alert("The passwords you have entered do not match!");
		return false;
	}
	
	var bday = $('#birth').val().split('-');
//	alert(bday);
	if (bday.length != 3) {
		alert("You have not entered your birthday correctly!");
		return false;
	}
	else {
		if (bday[0] > 12 || bday[0] < 0 || bday[1] > 31 || bday[1] < 0 || bday[2] > 2013 || bday[2] < 1900) {
			alert("You have not entered your birthday correctly!");
			return false;
		}
	}
	var formatbday = bday[2] + "-" + bday[0] + "-" + bday[1];

	var newuser = {
		login: $('#username').val(),
		pswd: $('#password').val(),
		givenname: $('#firstName').val(),
		surname: $('#lastName').val(),
		email: $('#email').val(),
		affiliation: $('#affiliation').val(),
		interests: $('#interests').val(),
		gender: $('input:radio[name=gender]:checked').val(),
		url: $('#url').val(),
		birthday: formatbday
	};
	
//	alert(newuser.birthday + " " + newuser.email);
//		alert(newpin.pinBoard + " " + newpin.sourceID + " " + newpin.pinBoard);
	$.get('/register', newuser, function(data) {
		if (!data){
			alert("An error has occurred during your registration!");
		}
		else{
			if (data == "User Duplicate"){
				alert("This username has already been taken!");
			}
			else{
				alert("Success! You will now be directed to the login page!");
				window.location.href = "/renderLogin";
			}
			
		}
	});
	});
});
