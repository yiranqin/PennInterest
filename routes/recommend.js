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
function get_recommend_contents(res, login) {
  	// For debugging
  	console.log("Get Recommends for User: " + login);
  	
  	login.trim();
  	oracle.connect(connectData, function(err, connection) {
		 if ( err ) {
		 	console.log(err);
		 } else {
			// try to get 24 objects with tags match interests, and those content given a score more than 4 by any of user's friend		
		  	connection.execute("With pool AS (SELECT otherFullObj.objectId, otherFullObj.sourceId, otherFullObj.url, otherFullObj.objectType, otherFullObj.cacheFlag, avgscore, tags  From  (SELECT otherObj.objectId, otherObj.sourceId, otherObj.url, otherObj.objectType, otherObj.cacheFlag, Round(AVG(Rating.score),2) as avgscore FROM Rating right outer join (((select objectId, sourceId, url, objectType, cacheFlag from ( select objectId, sourceId, url, objectType, cacheFlag, row_number() over (partition by url order by objectId) rn from Obj) where rn = 1) MINUS (SELECT Obj.* FROM Pin, Obj WHERE Pin.userID='" + login + "' and Pin.objectId = Obj.objectId and Pin.sourceId = Obj.sourceId) MINUS (SELECT Obj.* FROM Rating, Obj WHERE Rating.userID='" + login + "' and Rating.objectId = Obj.objectId and Rating.sourceId = Obj.sourceId))) otherObj on otherObj.objectId = Rating.objectId and otherObj.sourceId = Rating.sourceId GROUP BY otherObj.objectId, otherObj.sourceId, otherObj.url, otherObj.objectType, otherObj.cacheFlag) otherFullObj left outer join (SELECT objectID, sourceID, LISTAGG(tag, ',') WITHIN GROUP (ORDER BY tag) AS tags FROM Tag GROUP BY objectID, sourceID) userTags on otherFullObj.objectId = userTags.objectId and otherFullObj.sourceId = userTags.sourceId) "
		  						+ " SELECT * FROM( Select objectId, sourceId, url, objectType, cacheFlag, avgscore, tags from (select objectId, sourceId, url, objectType, cacheFlag, avgscore, tags, row_number() over (partition by url order by objectId) rn from (" +
		  						" (SELECT pool.* FROM pool,Interest,Tag  WHERE Interest.userID='" + login + "' and Interest.area like Tag.tag and Tag.objectId = pool.objectId and Tag.sourceId = pool.sourceId) "
		  						+ " Union " +
		  						" (SELECT pool.* From pool,Friend,Rating  WHERE Friend.userID='" + login + "' and Friend.friendID = Rating.userID and Rating.objectId = pool.objectId and Rating.sourceId = pool.sourceId and Rating.score >= 4))) Where rn = 1) Where rownum <= 12", 
		  			   [], 
		  			   function(err, results) {
		  	    if ( err ) {
		  	    	console.log(err);
		  	    } else {
		  	    	console.log("Number of Recommended Contents: " + results.length + " For User: " + login);
		  	    	
		  	    	// If matched contents not enough, random pick rest with score more than 4
		  	    	if(results.length < 24){
		  	    		var rest = 24 - results.length;
		  	    		
		  	    		var matchUnion = "";
		  	    		if(results.length > 0){
		  	    			matchUnion += " Minus ( Select * From Obj Where ";
		  	    			matchUnion += " (objectId = "+ parseInt(results[0].OBJECTID)+" and sourceId = '" + results[0].SOURCEID+ "') ";
		  	    			for(var i = 1; i < results.length; i++){
		  	    				matchUnion += " or (objectId = "+ parseInt(results[i].OBJECTID)+" and sourceId = '" + results[i].SOURCEID+ "')";
		  	    			}
		  	    			matchUnion += ")";
		  	    		}
		  	    			
		  	    		connection.execute("With pool AS (SELECT otherFullObj.objectId, otherFullObj.sourceId, otherFullObj.url, otherFullObj.objectType, otherFullObj.cacheFlag, avgscore, tags  From  (SELECT otherObj.objectId, otherObj.sourceId, otherObj.url, otherObj.objectType, otherObj.cacheFlag, Round(AVG(Rating.score),2) as avgscore FROM Rating right outer join (((select objectId, sourceId, url, objectType, cacheFlag from ( select objectId, sourceId, url, objectType, cacheFlag, row_number() over (partition by url order by objectId) rn from Obj) where rn = 1) MINUS (SELECT Obj.* FROM Pin, Obj WHERE Pin.userID='" + login + "' and Pin.objectId = Obj.objectId and Pin.sourceId = Obj.sourceId)  MINUS (SELECT Obj.* FROM Rating, Obj WHERE Rating.userID='" + login + "' and Rating.objectId = Obj.objectId and Rating.sourceId = Obj.sourceId) "+ matchUnion +")) otherObj on otherObj.objectId = Rating.objectId and otherObj.sourceId = Rating.sourceId GROUP BY otherObj.objectId, otherObj.sourceId, otherObj.url, otherObj.objectType, otherObj.cacheFlag) otherFullObj left outer join (SELECT objectID, sourceID, LISTAGG(tag, ',') WITHIN GROUP (ORDER BY tag) AS tags FROM Tag GROUP BY objectID, sourceID) userTags on otherFullObj.objectId = userTags.objectId and otherFullObj.sourceId = userTags.sourceId) "
		  	    							+ "SELECT * FROM (SELECT * FROM pool WHERE pool.avgscore >= 4 ORDER BY dbms_random.value) WHERE rownum <= "+ rest, 
		  	    							[], 
							  			   function(err, random) {
							  	    if ( err ) {
							  	    	console.log(err);
							  	    } else {
							  	    	connection.close();
							  	    	console.log("Number of Random Picked Top Score Contents: " + random.length + " For User: " + login);
							  	    	for(var i = 0; i < random.length; i++)
							  	    		results.push(random[i]);
							  	    	
							  	    	
							  	    	for(var i = 0; i < results.length; i++){
							  	    		// For those should be in cache
							  	    		if(parseInt(results[i].CACHEFLAG) >= 5 && (results[0].OBJECTTYPE == "photo" || results[0].OBJECTTYPE == "pdf")){
							  	    			results[i].URL = "http://" + host + "/fetchCachedData?url=" + results[i].URL;
							  	    		}
							  	    	}
							  	    	
						  	    		output_recommended_contents(res, login, results);	
							  	    }
		  	    		});
		  	    	}else{
		  	    		connection.close();
		  	    		output_recommended_contents(res, login, results);
		  	    	}
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
function output_recommended_contents(res,login,results) {
	console.log(results);
	res.render('homepage.jade',
		   { title: "Recommended Contents for User with login: " + login,
		     results: results, user: login }
	  );
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){	
	var login = req.session.login;
	console.log("Current User:" + login);
	if(login){
		get_recommend_contents(res, login);
	}else{
		res.redirect('/');
	}
	
};
