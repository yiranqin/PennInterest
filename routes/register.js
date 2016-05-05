// Connect string to Oracle
var connectData = { 
  "hostname": "cis550-project-oracle.cwk0ivvhztba.us-east-1.rds.amazonaws.com", 
  "user": "cis550project", 
  "password": "cis550project", 
  "database": "oracle" };
var oracle =  require("oracle");
var crypto = require('crypto');

/////
//Post the new user info to the oracle database, and gather results
//
//res = HTTP result object sent back to the client, basically success or not
//userInfo: login, pswd, affiliation, givenname,
//surname, birthday, email, gender, interests
function register_user(res, login, pswd, affiliation, givenname,
		surname, birthday, email, gender, interests) {
	// Hash the password
	var shasum = crypto.createHash('sha1');
	shasum.update(pswd);
	var passwordHash = shasum.digest('hex');
	
	// For debugging
	console.log("Register New User! userID: " + login +
			" password: " + passwordHash + 
			" affiliation: " + affiliation + 
			" givenname: " + givenname + 
			" surname: " + surname +
			" birthday: " + birthday + 
			" email: " + email + 
			" gender: " + gender +
			" interests: " + interests);
	
	oracle.connect(connectData, function(err, connection) {
	 if ( err ) {
	 	console.log(err);
	 } else {
	  	// insert row		 
	  	connection.execute("INSERT INTO Users VALUES('"+login+"', '"+passwordHash+"', '"+affiliation+"', '"+givenname+"', '"+surname+"', '"+email+"', to_date('"+birthday+"', 'YYYY-MM-DD'), '"+gender+"')", 
	  			   [], 
	  			   function(err, results) {
	  	    if ( err ) {
	  	    	console.log(err);
	  	    	res.send("Username Duplicate");
	  	    	connection.close();
	  	    	login_failed(res,login,results, "already been used");
	  	    } else {
	  	    	
	  	    	interests.trim();
	  		  	if(interests != ""){
	  			  	var interestsList = interests.split(",");
	  		  	    console.log("Interest List Length:" + interestsList.length);
	  		  	    
	  		  	    var query = "INSERT ALL ";	  		
	  		    	for (var inx = 0; inx < interestsList.length; inx++){
	  		    		query += " INTO interest VALUES('"+login+"', '"+interestsList[inx].trim()+"') ";
	  		    	}
	  		  		query += " SELECT * FROM dual";
	  		    	connection.execute(query,[], 
	  		    			function(err, results) {
	  		    		if ( err ) {
	  		    			console.log(err);
	  		    		}
	  		    		connection.close();
		  		  		return_login(res);
	  		    	}); // end connection.execute
	  		  	}else{
	  		  		connection.close();
	  		  		return_login(res);
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
function return_login(res,login,results) {
	res.send("Success");
}

/////
//Given a set of query results, output a table
//
//res = HTTP result object sent back to the client
//login = login to query for
//results = List object of query results
function login_failed(res,login,results, reason) {
	res.send("");
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){	
	register_user(res,req.query.login, req.query.pswd, req.query.affiliation, req.query.givenname,
			req.query.surname, req.query.birthday, req.query.email, req.query.gender, req.query.interests);
};