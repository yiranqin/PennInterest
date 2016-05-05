//$(document).ready(function(){
//	$("form[id^='rateButton']").on('submit', function(e) {
//		e.preventDefault();
//	var val = $(this).find("form[id^='rateButton']").val();
function updateRating(val) {
//	alert("hi");
//	var newrating = {
//		objectID: $(this).find('input[name=rateobjectID]').val(),
//		sourceID: $(this).find('input:hidden[name=ratesourceID]').val(),
//		rateValue: $(this).find('input:radio[name=rateValue]:checked').val(),
//		login: $("#username").text()
//	};
	var objInd = val + "objID";
	var srcInd = val + "srcID";
//	var objectID = $("#" + srcInd).val();
//	return objInd + srcInd;
	var newrating = {
		objectID: $("#" + objInd).val(),
		sourceID: $("#" + srcInd).val(),
		rateValue: $("#" + val + "radioDiv input[type='radio']:checked").val(),
		login: $("#username").text()
	};
//	alert(newrating.objectID + " " + newrating.sourceID + " " + newrating.rateValue + " " + newrating.login);
//}
	$.get('/rateContent', newrating, function(data) {
		if (! data) alert("Problem occurred while adding your rating to the database :(");
		else {
			document.getElementById(val+"newrating").innerHTML=data[0].AVGSCORE;
			alert("Success!");
		}
		
//		if (data == 0) document.getElementById(val+"error").innerHTML="Error adding new rating!";
//		else document.getElementById(val+"avgrating").innerHTML="Average rating: " + data;
	});
	
	return false;
}
		
//	});
//});