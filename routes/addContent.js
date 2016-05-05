// Connect string to Oracle
var connectData = { 
  "hostname": "cis550-project-oracle.cwk0ivvhztba.us-east-1.rds.amazonaws.com", 
  "user": "cis550project", 
  "password": "cis550project", 
  "database": "oracle" };
var oracle =  require("oracle");

/////
//add fresh content to user contents
//
//res = HTTP result object sent back to the client
//login = user login to query for
function add_board_content(res, login, boardName, url, type) {
  	// For debugging
  	console.log("Add New Content for User: " + login + " on board: " + boardName + " from url: " + url + " with type:" + type);
  	
  	
  	var sourceID = "Champion";
  	login.trim();
  	boardName.trim();
  	url.trim();
	oracle.connect(connectData, function(err, connection) {
	 if ( err ) {
	 	console.log(err);
	 	return_login(res);
	 } else {
	  	// get the current objectID
		connection.execute("SELECT count(*) as Num FROM Obj WHERE Obj.sourceID='" + sourceID + "'",
	  			   [], 
	  			   function(err, results) {
	  	    if ( err ) {
	  	    	console.log(err);
	  	    	connection.close();
	  	    	return_login(res, "error");
	  	    }
	  	    else{
	  	    	var nextObjectID = parseInt(results[0].NUM) + 1;
	  	    	console.log("Next objectID: " + nextObjectID + " for sourceID: " + sourceID);
	  	    	connection.execute("INSERT INTO Obj VALUES("+nextObjectID+", '"+sourceID+"','"+url+"', '"+type.toLowerCase()+"',1)",
			  			   [], 
			  			   function(err, results) {
			  	    if ( err ) {
			  	    	console.log(err);
			  	    	connection.close();
			  	    	return_login(res, "error");
			  	    }else{
			  	    	connection.execute("INSERT INTO Pin VALUES("+nextObjectID+", '"+sourceID+"','"+login+"', '"+boardName+"')",
					  			   [], 
					  			   function(err, results) {
					  	    if ( err ) {
					  	    	console.log(err);
					  	    	connection.close();
					  	    	return_login(res, "error");
					  	    }else{
					  	    	connection.close();
					  	    	return_login(res, "success!");
					  	    }
			  	    	}); // end connection.execute
			  	    }
			  	   
			  	}); // end connection.execute
	  	    }	  	    
	  	}); // end connection.execute		
	 }
	}); // end oracle.connect
}

/////
//Return to the login page
//
//res = HTTP result object sent back to the client
function return_login(res, data) {
	res.send(data);
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){	
	add_board_content(res,req.query.login, req.query.pinBoard, req.query.url, req.query.type);
};
