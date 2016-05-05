$(document).ready(function(){
	$("#pinform").on('submit', function(e) {
		e.preventDefault();
//		alert("hi");
//		var complete = $("#pinform").serialize();
//		var newpin = $("#pinform: input").map(function(index, elm) {
//			var name= elm.name;
//			var value = $(elm).val();
//		    return {name: value};
//		});
//		var newpin = {
//			objectID: $("input#objID").val(),
//			sourceID: $("input#srcID").val(),
//			pinBoard: $("input#board").val(),
//			login: $("#username").text()
//		};
//	var objectID = document.getElementById('objectID');
//	var id = objectID.value;
//	alert(id);
	var newpin = {
		objectID: document.getElementById("objID").value,
		sourceID: document.getElementById("srcID").value,
		pinBoard: $('input:radio[name=pinBoard]:checked').val(),
		login: $("#username").text()
	};
//		alert(newpin.objectID + " " + newpin.sourceID + " " + newpin.pinBoard);
	$.get('/pinContent', newpin, function(data) {
		alert(data);
	});
	});
});
