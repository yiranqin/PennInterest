//reference to https://github.com/cfjedimaster/AndKittens
//added for search


var querystring = require("querystring");
var account_key = "jHaYFx+dTLcFNZcZr3LtL1xv8HJQdXeC/lkUrSG7yeQ";
var https = require('https');

function bing_search(res, keyword) {
    var result = {success:false};
    console.log("Bing Search for "+ keyword);
    var options = {
            hostname:"api.datamarket.azure.com",
            port: 443,
            path:"/Bing/Search/Image?Query=%27" + querystring.escape(keyword) + "%27&$top=12&$format=json", 
            auth:":jHaYFx+dTLcFNZcZr3LtL1xv8HJQdXeC/lkUrSG7yeQ",
    };

    https.get(options, function(results, keyword) {
            var body = "";
            
            results.on('data', function (chunk) {
                    body += chunk;
            });
           
            results.on('end', function() {
                    result.success = true;
                   
                    var data = JSON.parse(body);
                 //   console.log(data.d.results);
                    result.data = data.d.results;
                    
                  // console.log("this is" +result.data);
                   var bingresults = [];
                   for(var i=0;i<result.data.length;i++){
                	   var eachObj = result.data[i];
                	   var mediaRes = eachObj.MediaUrl;
                	   bingresults.push(mediaRes);
                	   console.log(i);
                	   console.log(mediaRes);
                   }
                   output_bingsearch(res, bingresults);
                    
                 //   console.log(result.data);
                   // cb(result);
            });

    });

}

/////
//Given a set of query results, output a table
//
//res = HTTP result object sent back to the client
//login = login to query for
//results = List object of query results
function output_bingsearch(res, bingresults) {
	console.log(bingresults);
	res.send(bingresults);
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){	
	var login = req.session.login;
	console.log("Current User:" + login);
	if(login){
		bing_search(res, req.query.keyword);
	}else{
		res.redirect('/');
	}
};