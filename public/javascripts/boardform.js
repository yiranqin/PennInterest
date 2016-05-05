$(document).ready(function(){
	$("#subButton").click(function() {
		if(!$("input#inputBoard").val()){
			alert("You have to give a board name!");
			return false;
		}
//$(function(){
// $('#inputBoard').on('keyup', function(e){
//   if(e.keyCode === 13) {
//		alert("hello");
		var boardset = {
			boardName: $("input#inputBoard").val(),
			boardType: $("input#inputBoardType").val(),
			login: $("#userProfile").text()
		};
//		alert(boardset.boardName + " " + boardset.boardType + " " + boardset.login);
		$.get('/addBoard', boardset, function(data) {
			$("input#inputBoard").val('');
			$("input#inputBoardType").val('');
//		    $('#boardList').html(data);
			if (!data) {
				alert("Error adding the board!");
				return false;
			}

			var div = document.createElement("Div");
			div.setAttribute("id", "boardList");
			document.getElementById('boards').appendChild(div);

			var header = document.createElement("Label");
			header.setAttribute("id", "header");
			header.innerHTML = "For board";
			div.appendChild(header);

		    var headlabel = document.createElement("Label");
		    headlabel.setAttribute("id", "board");
		    headlabel.setAttribute("class", "text2");
		    headlabel.innerHTML = data;
		    div.appendChild(headlabel);

		    var newform = document.createElement("form");
		    newform.setAttribute("id", "boardForm");
		    newform.name='boardForm';
		    newform.method='GET';
		    newform.action='/userBoardContents';
		    div.appendChild(newform);

		    newinput=document.createElement('INPUT');
		    newinput.setAttribute("id", "name");
		    newinput.type='hidden';
		    newinput.name='boardName';
		    newinput.value=data;

		    submit=document.createElement('INPUT');
		    submit.type='submit';
		    submit.setAttribute("class", "clickme");
		    submit.value='Click to view';

		    newform.appendChild(newinput);
		    newform.appendChild(submit);

		});
//   		}
	});
});


