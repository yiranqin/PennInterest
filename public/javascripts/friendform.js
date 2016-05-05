$(document).ready(function(){
	$("#submitFriend").click(function() {  
//$(function(){
// $('#inputBoard').on('keyup', function(e){
//   if(e.keyCode === 13) {
//		alert("hello");
		var newfriend = {
			friendname: $("input#inputFriend").val(),
			login: $("#userProfile").text()
		};
//		alert(boardset.boardName + " " + boardset.boardType + " " + boardset.login);
		$.get('/addFriend', newfriend, function(data) {
//		    $('#boardList').html(data);
			$("input#inputFriend").val("");
			if (!data) {alert("Error adding new friend!"); return false;}
			var table = document.getElementById('friendTable');
			var row = table.insertRow(-1);
			var cell = row.insertCell(0);
			var element = document.createTextNode(data);
			cell.appendChild(element);
			
//			var friend = document.createElement("Label");
//			friend.setAttribute("id", "friendname");
//			friend.innerHTML = data;
//			document.getElementById('friendTable').appendChild(friend); 
		});
//   		}
	});
});
