$(document).ready(function(){
	$("#submitInterest").click(function() {  
//$(function(){
// $('#inputBoard').on('keyup', function(e){
//   if(e.keyCode === 13) {
//		alert("hello");
		var newinterest = {
			interestname: $("input#inputInterest").val(),
			login: $("#userProfile").text()
		};
//		alert(boardset.boardName + " " + boardset.boardType + " " + boardset.login);
		$.get('/addInterest', newinterest, function(data) {
//		    $('#boardList').html(data);
			
			$("input#inputInterest").val("");
			if (!data) {alert("Error adding new interest!"); return false;}
			var table = document.getElementById('interestTable');
			
			var partsOfStr = data.split(',');
			partsOfStr.forEach(function(entry){
				var row = table.insertRow(-1);
				var cell = row.insertCell(0);
				var element = document.createTextNode(entry);
		        cell.appendChild(element);
			});
			
			
//			var interest = document.createElement("Label");
//			interest.setAttribute("id", "interest");
//			interest.innerHTML = data;
//			document.getElementById('interestTable').appendChild(interest); 
		});
//   		}
	});
});
