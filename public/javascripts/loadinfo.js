function objInfo(val){
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
	$.get('/objectInfo', objInfo, function(data) {
		if (!data){
			document.getElementById(val+"tags").innerHTML="This content has no tags associated with it";
			document.getElementById(val+"avgrating").innerHTML="This content has no ratings associated with it";
		}
		else {
			if (!data[0].TAGS) document.getElementById(val+"tags").innerHTML="This content has no tags associated with it";
			else {
				document.getElementById(val+"tags").innerHTML="Tags: ";
				var partsOfStr = data[0].TAGS.split(',');
				partsOfStr.forEach(function(entry){
					document.getElementById(val+"tags").innerHTML+=entry+ ", ";
				});
			}
			if (!data[0].AVGSCORE) document.getElementById(val+"avgrating").innerHTML="This content has no ratings associated with it";
			else document.getElementById(val+"avgrating").innerHTML="Average rating: " + data[0].AVGSCORE;
		}
	});
}