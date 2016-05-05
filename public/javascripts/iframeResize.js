function resize_iframe(){ 
	document.getElementById("sizeframe").width=null;
	document.getElementById("sizeframe").width=window.frames["sizeframe"].document.body.scrollWidth;
	document.getElementById("sizeframe").height=null; 
	document.getElementById("sizeframe").height=window.frames["sizeframe"].document.body.scrollHeight; 
} 