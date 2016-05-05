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
function add_user_friend(res, login, friendID) {
  	// For debugging
  	console.log("Add New Friend for User: " + login + " friendID: " + friendID);
  	
  	login.trim();
  	friendID.trim();
	oracle.connect(connectData, function(err, connection) {
		 if ( err ) {
		 	console.log(err);
		 } else {
		  	// insert friend
		  	connection.execute("INSERT INTO Friend VALUES('"+login+"', '"+friendID+"')",
		  			   [], 
		  			   function(err, results) {
		  	    if ( err ) {
		  	    	console.log(err);
		  	    	connection.close();
					return_login(res, "");
		  	    }else{
		  	    	// insert friend
				  	connection.execute("INSERT INTO Friend VALUES('"+friendID+"', '"+login+"')",
				  			   [], 
				  			   function(err, results) {
				  	    if ( err ) {
				  	    	console.log(err);
				  	    }
						connection.close();
						return_login(res, friendID);
				  	}); // end connection.execute
		  	    }
		  	}); 
		 }
	}); // end oracle.connect
}

/////
//Return to the login page
//
//res = HTTP result object sent back to the client
function return_login(res, friend) {
	res.send(friend);
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){	
	var login = req.session.login;
	console.log("Current User:" + login);
	if(login){
		add_user_friend(res, login, req.query.friendname);
	}else{
		res.redirect('/');
	}
};
