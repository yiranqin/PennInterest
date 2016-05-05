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
function add_user_board(res, login, boardName, boardType) {
  	// For debugging
  	console.log("Add New Board for User: " + login + " boardName: " + boardName + " boardType: " + boardType);
  	
  	login.trim();
  	boardName.trim();
  	boardType.trim();
	oracle.connect(connectData, function(err, connection) {
	 if ( err ) {
	 	console.log(err);
		return_login(res, '');
	 } else {
	  	// insert board
		if(boardType != ""){
		  	connection.execute("INSERT INTO Board VALUES('"+login+"', '"+boardName+"', '"+boardType+"')",
		  			   [], 
		  			   function(err, results) {
		  	    if ( err ) {
		  	    	console.log(err);
				connection.close();
				return_login(res, "");
		  	    }else{
		  	    
	  	    		connection.close();
	  			return_login(res, boardName);
			}
		  	}); // end connection.execute	  	
		}else{
			connection.execute("INSERT INTO Board VALUES('"+login+"', '"+boardName+"', NULL)",
		  			   [], 
		  			   function(err, results) {
		  	    if ( err ) {
		  	    	console.log(err);
				connection.close();
				return_login(res, "");
		  	    }else{ 
		  	    
	  	    		connection.close();
	  			return_login(res, boardName);
			}
		  	}); // end connection.execute
		}
	 }
	}); // end oracle.connect
}

/////
//Return to the login page
//
//res = HTTP result object sent back to the client
function return_login(res, name) {
	res.send(name);
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){
	var login = req.session.login;
	console.log("Current User:" + login);
	if(login){
		add_user_board(res, login, req.query.boardName, req.query.boardType);
	}else{
		res.redirect('/');
	}
};
