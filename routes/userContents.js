// Connect string to Oracle
var connectData = { 
  "hostname": "cis550-project-oracle.cwk0ivvhztba.us-east-1.rds.amazonaws.com", 
  "user": "cis550project", 
  "password": "cis550project", 
  "database": "oracle" };
var oracle =  require("oracle");
var host = "ec2-54-209-181-22.compute-1.amazonaws.com:8080";

/////
//Query the oracle database to get all contents of given user
//
//res = HTTP result object sent back to the client
//login = user name to query for
function get_user_contents(res, login) {
	// For debugging
	console.log("Get All Contents Pinned or Rated by User: " + login);
	
	login.trim();
	oracle.connect(connectData, function(err, connection) {
		 if ( err ) {
		 	console.log(err);
		 } else {
		  	// selecting rows from both Pins and Ratings
		  	connection.execute("With userObj AS ((SELECT Obj.* FROM Pin, Obj WHERE Pin.userID='" + login + "' and Pin.objectId = Obj.objectId and Pin.sourceId = Obj.sourceId) Union (SELECT Obj.* FROM Rating, Obj WHERE Rating.userID='" + login + "' and Rating.objectId = Obj.objectId and Rating.sourceId = Obj.sourceId)) SELECT userFullObj.objectId, userFullObj.sourceId, userFullObj.url, userFullObj.objectType, userFullObj.cacheFlag, avgscore, tags  From  (SELECT userObj.objectId, userObj.sourceId, userObj.url, userObj.objectType, userObj.cacheFlag, Round(AVG(Rating.score),2) as avgscore FROM Rating right outer join userObj on userObj.objectId = Rating.objectId and userObj.sourceId = Rating.sourceId GROUP BY userObj.objectId, userObj.sourceId, userObj.url, userObj.objectType, userObj.cacheFlag) userFullObj left outer join (SELECT objectID, sourceID, LISTAGG(tag, ',') WITHIN GROUP (ORDER BY tag) AS tags FROM Tag GROUP BY objectID, sourceID) userTags on userFullObj.objectId = userTags.objectId and userFullObj.sourceId = userTags.sourceId", 
		  			   [], 
		  			   function(err, results) {
		  	    if ( err ) {
		  	    	console.log(err);
		  	    } else {
		  	    	connection.close();
		  	    	console.log("Number of Contents: " + results.length + " For User: " + login);
		  	    	
		  	    	for(var i = 0; i < results.length; i++){
		  	    		// For those should be in cache
		  	    		if(parseInt(results[i].CACHEFLAG) >= 5 && (results[0].OBJECTTYPE == "photo" || results[0].OBJECTTYPE == "pdf")){
		  	    			results[i].URL = "http://" + host + "/fetchCachedData?url=" + results[i].URL;
		  	    		}
		  	    	}
		  	    	
		  	    	output_user_contents(res, login, results);
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
function output_user_contents(res,login,results) {
	console.log(results);
	res.render('usercontent.jade',
		   { title: "Contents of User with login: " + login,
		     results: results, user: login }
	  );
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){	
	var login = req.session.login;
	console.log("Current User:" + login);
	if(login){
		get_user_contents(res,login);
	}else{
		res.redirect('/');
	}
};
