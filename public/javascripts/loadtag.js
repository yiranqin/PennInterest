function loadTags(val){
//	alert("true");
	var tagInd = val + "resultTags";
	var data = $("#" + tagInd).val();
//	alert(val + " " + data);
	if (!data){
		document.getElementById(val+"tags").innerHTML="This content has no tags associated with it";
	}
	else {
		document.getElementById(val+"tags").innerHTML="Tags: ";
		var partsOfStr = data.split(',');
		partsOfStr.forEach(function(entry){
			document.getElementById(val+"tags").innerHTML+=entry+ ", ";
		});
	}
}