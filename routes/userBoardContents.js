// Connect string to Oracle
var connectData = { 
  "hostname": "cis550-project-oracle.cwk0ivvhztba.us-east-1.rds.amazonaws.com", 
  "user": "cis550project", 
  "password": "cis550project", 
  "database": "oracle" };
var oracle =  require("oracle");
var host = "ec2-54-209-181-22.compute-1.amazonaws.com:8080";

/////
//Query the oracle database to get all boards of given user
//
//res = HTTP result object sent back to the client
//login = user login to query for
//boardName = name of a board of the user
function get_user_board_contents(res, login, boardName) {
	// For debugging
	console.log("Get All Contents of Board: "+ boardName + " of User: " + login);
	
	login.trim();
	boardName.trim();
	oracle.connect(connectData, function(err, connection) {
	 if ( err ) {
	 	console.log(err);
	 } else {
	  	// selecting rows		 
	  	connection.execute("With userObj AS (SELECT Obj.* FROM Board, Pin, Obj WHERE Board.userID='" + login + "' and Board.boardName='" + boardName + "' and Board.userId = Pin.userId and Board.boardName = Pin.boardName and Pin.objectId = Obj.objectId and Pin.sourceId = Obj.sourceId) "
	  					+ "SELECT userFullObj.objectId, userFullObj.sourceId, userFullObj.url, userFullObj.objectType, userFullObj.cacheFlag, avgscore, tags  From  (SELECT userObj.objectId, userObj.sourceId, userObj.url, userObj.objectType, userObj.cacheFlag, Round(AVG(Rating.score),2) as avgscore FROM Rating right outer join userObj on userObj.objectId = Rating.objectId and userObj.sourceId = Rating.sourceId GROUP BY userObj.objectId, userObj.sourceId, userObj.url, userObj.objectType, userObj.cacheFlag) userFullObj left outer join (SELECT objectID, sourceID, LISTAGG(tag, ',') WITHIN GROUP (ORDER BY tag) AS tags FROM Tag GROUP BY objectID, sourceID) userTags on userFullObj.objectId = userTags.objectId and userFullObj.sourceId = userTags.sourceId ", 
	  			   [], 
	  			   function(err, results) {
	  	    if ( err ) {
	  	    	console.log(err);
	  	    } else {
	  	    	connection.close();
	  	    	console.log("Number of Contents: " + results.length + " For Board: "+ boardName + " of User: " + login);
	  	    	
	  	    	for(var i = 0; i < results.length; i++){
	  	    		// For those should be in cache
	  	    		if(parseInt(results[i].CACHEFLAG) >= 5 && (results[0].OBJECTTYPE == "photo" || results[0].OBJECTTYPE == "pdf")){
	  	    			results[i].URL = "http://" + host + "/fetchCachedData?url=" + results[i].URL;
	  	    		}
	  	    	}
	  	    	
	  	    	output_user_board_contents(res, login, boardName, results);
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
//boardName = name of a board of the user
//results = List object of query results
function output_user_board_contents(res,login,boardName,results) {
	res.render('oneBoard.jade',
		   { title: "Contents of Board: "+ boardName + " of User: " + login,
		     results: results, boardname: boardName}
	  );
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){	
	var login = req.session.login;
	console.log("Current User:" + login);
	if(login){
		get_user_board_contents(res,login, req.query.boardName);
	}else{
		res.redirect('/');
	}
};
