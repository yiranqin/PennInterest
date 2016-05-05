// Connect string to Oracle
var connectData = { 
  "hostname": "cis550-project-oracle.cwk0ivvhztba.us-east-1.rds.amazonaws.com", 
  "user": "cis550project", 
  "password": "cis550project", 
  "database": "oracle" };
var oracle =  require("oracle");
var crypto = require('crypto');

/////
//Query the oracle database, and call output_users on the results
//
//res = HTTP result object sent back to the client
//login = login to query for
//curPswd = old password
//newPswd = new password
function update_passwords(res, login, curPswd, newPswd) {
	// For debugging
	console.log("Attempt to Update Password: "+ curPswd + " with New Password: " + newPswd);
	
	login.trim();
	curPswd.trim();
	newPswd.trim();
	
	oracle.connect(connectData, function(err, connection) {
	 if ( err ) {
	 	console.log(err);
	 } else {
	  	// selecting rows
	  	connection.execute("SELECT passwords FROM Users WHERE userID='" + login + "'", 
	  			   [], 
	  			   function(err, results) {
	  	    if ( err ) {
	  	    	console.log(err);
	  	    	connection.close(); // done with the connection
				return_login(res);
	  	    } else {
	  	    	var shasum = crypto.createHash('sha1');
	  	    	shasum.update(curPswd);
	  	    	var passwordHash = shasum.digest('hex');
	  	    	console.log("Password Hash:" + passwordHash + " Stored Password Hash:" + (results.length == 0 ? "" :results[0].PASSWORDS));
	  	    	
	  	    	// Update the password only when after validating it
	  	    	if(results.length != 0 && results[0].PASSWORDS == passwordHash){
	  	    		var shasum = crypto.createHash('sha1');
	  	    		shasum.update(newPswd);
		  	    	var newpswdHash = shasum.digest('hex');
		  	    	console.log("Updated Password Hash:" + newpswdHash);
	  	    		
	  	    		connection.execute("UPDATE Users SET passwords = '"+ newpswdHash +"' WHERE userID='" + login + "'", 
	  		  			   [], 
	  		  			   function(err, results){
	  	    			if(err){
	  	    				console.log(err);
	  	    			}
	  	    			
	    				connection.close(); // done with the connection
	    				return_login(res);
	  	    		});
	  	    	}
	  	    	else
	  	    		login_failed(res,login,results);
	  	    }
	  	}); // end connection.execute
	 }
	}); // end oracle.connect
}

/////
//Return to the login page
//
//res = HTTP result object sent back to the client
function return_login(res,login,results) {
	res.send("Success");
}


/////
//Given a set of query results, output a table
//
//res = HTTP result object sent back to the client
//login = login to query for
//results = List object of query results
function login_failed(res,login,results) {
	res.send("");
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){
	update_passwords(res, req.query.login, req.query.oldpass, req.query.newpass);
};
