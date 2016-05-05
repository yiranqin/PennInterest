// Connect string to Oracle
var connectData = { 
  "hostname": "cis550-project-oracle.cwk0ivvhztba.us-east-1.rds.amazonaws.com", 
  "user": "cis550project", 
  "password": "cis550project", 
  "database": "oracle" };
var oracle =  require("oracle");

/////
//add new board to user
//
//res = HTTP result object sent back to the client
//login = user login to query for
function add_content_tag(res, objectIDStr, sourceID, tag) {
  	// For debugging
  	console.log("Add New Tag for objectID: " + objectIDStr + " sourceID: " + sourceID + " tag: " + tag);
  	
  	objectIDStr.trim();
  	sourceID.trim();
  	tag.trim();
  	var objectID = parseInt(objectIDStr);
	oracle.connect(connectData, function(err, connection) {
		 if ( err ) {
		 	console.log(err);
		 	return_login(res, "");
		 } else {
		  	// insert friend
		  	connection.execute("INSERT INTO Tag VALUES("+objectID+", '"+sourceID+"', '"+tag+"')",
		  			   [], 
		  			   function(err, results) {
		  	    if ( err ) {
		  	    	console.log(err);
		  	    	return_login(res, "");
		  	    }
		  	    
	  	    	connection.close();
	  	    	return_login(res, tag);
		  	}); // end connection.execute	  	
		 }
	}); // end oracle.connect
}

/////
//Return to the login page
//
//res = HTTP result object sent back to the client
function return_login(res, newtag) {
	console.log("tagstart");
	console.log(newtag);
	res.send(newtag);
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){	
	add_content_tag(res,req.query.objectID, req.query.sourceID, req.query.tag);
};
