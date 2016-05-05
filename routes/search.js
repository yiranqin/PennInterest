// Connect string to Oracle
var connectData = { 
  "hostname": "cis550-project-oracle.cwk0ivvhztba.us-east-1.rds.amazonaws.com", 
  "user": "cis550project", 
  "password": "cis550project", 
  "database": "oracle" };
var oracle =  require("oracle");
var host = "ec2-54-209-181-22.compute-1.amazonaws.com:8080";

/////
//Query the oracle database to get the recommended contents for given user
//
//res = HTTP result object sent back to the client
//login = user login to query for
function search_contents(res, login, keyword) {
  	// For debugging
	var original = keyword;
  	console.log("Get Searched Content for User: " + login + " keyword: " + keyword);
  	
  	login.trim();
  	keyword.trim();
  	oracle.connect(connectData, function(err, connection) {
		 if ( err ) {
		 	console.log(err);
		 } else {
		  	// selecting rows
			// Find all possible matching object with tags ignoring plural and upper lower case
			var suffix = "s";
			keyword = (keyword.indexOf(suffix, keyword.length - suffix.length) !== -1) ? keyword.substring(0, keyword.length - suffix.length) + "%": keyword + "%";
			var processedKeyword = keyword.toUpperCase(); 
		  	connection.execute("With pool AS (SELECT otherFullObj.objectId, otherFullObj.sourceId, otherFullObj.url, otherFullObj.objectType, otherFullObj.cacheFlag, avgscore, tags  From  (SELECT otherObj.objectId, otherObj.sourceId, otherObj.url, otherObj.objectType, otherObj.cacheFlag, Round(AVG(Rating.score),2) as avgscore FROM Rating right outer join (((select objectId, sourceId, url, objectType, cacheFlag from ( select objectId, sourceId, url, objectType, cacheFlag, row_number() over (partition by url order by objectId) rn from Obj) where rn = 1) MINUS (SELECT Obj.* FROM Pin, Obj WHERE Pin.userID='"+ login +"' and Pin.objectId = Obj.objectId and Pin.sourceId = Obj.sourceId) MINUS(SELECT Obj.* FROM Rating, Obj WHERE Rating.userID='" + login + "' and Rating.objectId = Obj.objectId and Rating.sourceId = Obj.sourceId))) otherObj on otherObj.objectId = Rating.objectId and otherObj.sourceId = Rating.sourceId GROUP BY otherObj.objectId, otherObj.sourceId, otherObj.url, otherObj.objectType, otherObj.cacheFlag) otherFullObj left outer join (SELECT objectID, sourceID, LISTAGG(tag, ',') WITHIN GROUP (ORDER BY tag) AS tags FROM Tag GROUP BY objectID, sourceID) userTags on otherFullObj.objectId = userTags.objectId and otherFullObj.sourceId = userTags.sourceId) "
		  						+ " Select objectId, sourceId, url, objectType, cacheFlag, avgscore, tags from ( select objectId, sourceId, url, objectType, cacheFlag, avgscore, tags, row_number() over (partition by url order by objectId) rn from (SELECT pool.* FROM pool, Tag WHERE UPPER(Tag.tag) like '" + processedKeyword + "' and Tag.objectId = pool.objectId and Tag.sourceId = pool.sourceId) matchedObj) where rn = 1", 
		  			   [], 
		  			   function(err, results) {
		  	    if ( err ) {
		  	    	console.log(err);
		  	    	connection.close();
		  	    } else {
		  	    	connection.close();
		  	    	console.log("Number of Matched Contents: " + results.length + " For User: " + login + " keyword: " + processedKeyword);
		  	    	
		  	    	for(var i = 0; i < results.length; i++){
		  	    		// For those should be in cache
		  	    		if(parseInt(results[i].CACHEFLAG) >= 5 && (results[0].OBJECTTYPE == "photo" || results[0].OBJECTTYPE == "pdf")){
		  	    			results[i].URL = "http://" + host + "/fetchCachedData?url=" + results[i].URL;
		  	    		}
		  	    	}
		  	    	
		  	    	output_searched_contents(res, login, original, results);
		  	    }
		  	}); // end connection.execute	  	
		 }
	}); // end oracle.connect
}


/////
//Given a set of query results, output a table
//
//res = HTTP result object sent back to the client
//login = login to query for
//results = List object of query results
function output_searched_contents(res,login, keyword, results) {
	res.render('searchResults.jade', {
	    title: 'Search Results!', results: results, keyword: keyword
	  });
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){	
	var login = req.session.login;
	console.log("Current User:" + login);
	if(login){
		search_contents(res, login, req.query.keyword);
	}else{
		res.redirect('/');
	}
};
