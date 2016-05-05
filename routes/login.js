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
function validate_user(res, req) {
	// For debugging
	var login = req.query.login;
	var pswd = req.query.pswd;
  	console.log("Attempt to Login: "+ login + " with Password: " + pswd);
	
	login.trim();
	pswd.trim();
	oracle.connect(connectData, function(err, connection) {
	 if ( err ) {
	 	console.log(err);
	 	res.send("");
	 } else {
	  	// selecting rows
	  	connection.execute("SELECT passwords FROM Users WHERE userID='" + login + "'", 
	  			   [], 
	  			   function(err, results) {
	  	    if ( err ) {
	  	    	console.log(err);
	  	    	res.send("");
	  	    } else {
	  	    	connection.close(); // done with the connection
	  	    	var shasum = crypto.createHash('sha1');
	  	    	shasum.update(pswd);
	  	    	var passwordHash = shasum.digest('hex');
	  	    	console.log("Password Hash:" + passwordHash + " Stored Password Hash:" + (results.length == 0 ? "" :results[0].PASSWORDS));
	  	    	// If the user is validated, redirect to the profile page 
	  	    	if(results.length != 0 && results[0].PASSWORDS == passwordHash){
	  	    		req.session.login = login;
//	  	    		res.redirect('/recommend');
	  	    		res.send('Success!');
	  	    	}
	  	    	// If the user failed validation, redirect to the login page with error flag
	  	    	else{
	  	    		res.send("");
//	  	    		res.redirect('/');
	  	    	}
	  	    }
	  	}); // end connection.execute
	 }
	}); // end oracle.connect
}


/////
// This is what's called by the main app 
exports.do_work = function(req, res){
//	console.log("Good");
	validate_user(res, req);
};
