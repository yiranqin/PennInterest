// Connect string to Oracle
var connectData = { 
  "hostname": "cis550-project-oracle.cwk0ivvhztba.us-east-1.rds.amazonaws.com", 
  "user": "cis550project", 
  "password": "cis550project", 
  "database": "oracle" };
var oracle =  require("oracle");

/////
//Query the oracle database to get all boards of given user
//
//res = HTTP result object sent back to the client
//login = user login to query for
function get_user_boards(res, req, login) {
  	// For debugging
  	console.log("Get All Boards of User: " + login);
  	
  	login.trim();
	oracle.connect(connectData, function(err, connection) {
	 if ( err ) {
	 	console.log(err);
	 } else {
	  	// selecting rows		 
	  	connection.execute("SELECT * FROM Board WHERE userID='" + login + "'", 
	  			   [], 
	  			   function(err, results) {
	  	    if ( err ) {
	  	    	console.log(err);
	  	    } else {
	  	    	connection.close();
	  	    	console.log("Number of Boards: " + results.length + " For User: " + login);
	  	    	output_user_boards(res, req, login, results);
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
function output_user_boards(res, req, login,results) {
	res.render('addcontent.jade',
		   { title: "Boards of User with login: " + login,
		     boardresults: results, url: req.query.url,
		     user: login}
	  );
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){
	var login = req.session.login;
	if(login){
		get_user_boards(res, req, login);
	}else{
		res.redirect('/');
	}
};
