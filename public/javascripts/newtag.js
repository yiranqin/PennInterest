function addtag(val){
//	alert("hi");
	var objInd = val + "objID";
	var srcInd = val + "srcID";
	var tags = val + "tag";

	var tagInfo = {
		objectID: $("#" + objInd).val(),
		sourceID: $("#" + srcInd).val(),
		tag: $("#" + tags).val(),
		login: $("#username").text()
	};
	
//	alert(tagInfo.objectID + " " + tagInfo.sourceID + " " + tagInfo.tag + " " + tagInfo.login);
	
	$.get('/addTag', tagInfo, function(data) {
		if (!data) alert("Problem occurred while adding your tag to the database :(");
		else {
			var partsOfStr = data.split(',');
			if (document.getElementById(val+"tags").innerHTML.indexOf("content has no tags associated") > -1){
				document.getElementById(val+"tags").innerHTML="Tags: ";
			}
			partsOfStr.forEach(function(entry){
				document.getElementById(val+"tags").innerHTML+=entry+ ", ";
			});
			document.getElementById(val+"firstupdate").innerHTML="The following tags have been added: " + data;
			alert("Success!");
		}
	});
	
	return false;
	
}