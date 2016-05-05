$(document).ready(function(){
	$("#pinform").on('submit', function(e) {
		e.preventDefault();
//		alert("hi");

	var newpin = {
		pinBoard: $('input:radio[name=pinBoard]:checked').val(),
		url: $('#url').val(),
		type: $('#objecttype').val(),
		login: $("#username").text()
	};
	
	
//		alert(newpin.pinBoard + " " + newpin.sourceID + " " + newpin.pinBoard);
	$.get('/addContent', newpin, function(data) {
		alert(data);
	});
	});
});
