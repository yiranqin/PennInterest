function objRating(val){
//	console.log(objID);
//	return source;
//	alert("hi");
	var objInd = val + "objID";
	var srcInd = val + "srcID";
//	var objectID = $("#" + srcInd).val();
//	return objInd + srcInd;
	var objInfo = {
		objectID: $("#" + objInd).val(),
		sourceID: $("#" + srcInd).val(),
		login: $("#username").text()
	};
//	return objInfo.objectID + objInfo.sourceID + objInfo.login;
//	return objInfo.objectID + objInfo.sourceID + objInfo.login;
//	alert(objInfo.objectID + " " + objInfo.sourceID + " " + objInfo.login);
	$.get('/objectRatings', objInfo, function(data) {
		document.getElementById(val+"text").innerHTML=data;
	});
}