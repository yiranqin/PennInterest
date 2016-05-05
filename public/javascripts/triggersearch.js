function bingSearch(){
	var keys = {
		keyword: $("#keyword").text()
	};
	
	$.get('/bingsearch', keys, function(data) {
		for (var i = 0; i < data.length; i++){
			$("#" + i + "bing").attr('src', data[i]);
			$("#" + i + "url").attr('value', data[i]);
			
			var header = document.createElement("Input");
			header.setAttribute("id", "pin");
			header.setAttribute("type", "submit");
			header.setAttribute("value", "Add this content!");
			$("#" + i + "label").append(header);

		}	
	});
}