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
function get_user_profile(res, login) {
	// For debugging
	console.log("Get Profile of User: " + login);
	
	login.trim();
	// selecting rows
	oracle.connect(connectData, function(err, connection) {
		if(err){
			console.log(err);
		}else{
			connection.execute("SELECT userId, passwords, affiliation, givenname, surname, email, to_char(birthday, 'yyyy-mm-dd') as birthday, gender FROM Users WHERE userID='" + login + "'", 
					[], 
					function(err, userInfo) {
				if ( err ) {
					console.log(err);
					connection.close();
				} else {
					console.log("Got User Info for: " + login);
					
					connection.execute("SELECT area FROM Interest WHERE userID='" + login + "'", 
							[], 
							function(err, userInterests) {
						if ( err ) {
							console.log(err);
							connection.close();
						} else {
							console.log("Number of Interests: " + userInterests.length + " For User: " + login);
							
							connection.execute("SELECT friendID FROM Friend WHERE userID='" + login + "'", 
									[], 
									function(err, userFriends) {
								if ( err ) {
									console.log(err);
									connection.close();
								} else {
									console.log("Number of Friends: " + userFriends.length + " For User: " + login);
									
									connection.execute("SELECT * From (SELECT * FROM ((SELECT Interest.userID FROM (SELECT area FROM Interest Where userID = '" + login + "') userInterests, Interest WHERE Interest.userID <> '" + login + "' and Interest.area like userInterests.area) MINUS (SELECT friendID FROM Friend Where userID = '" + login + "')) ORDER BY dbms_random.value) Where rownum <= 12", 
		  									[], 
		  									function(err, peopleWithSameInterests) {
		  								if ( err ) {
		  									console.log(err);
		  									connection.close();
		  								} else {
		  									connection.close();
		  									console.log("Number of Potential Friends: " + peopleWithSameInterests.length + " For User: " + login);
		  									output_user_profile(res, login, userInfo, userInterests, userFriends, peopleWithSameInterests);
		  								}
		  							}); // end connection.execute
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
//Given a set of query results, output a table
//
//res = HTTP result object sent back to the client
//login = login to query for
//results = List object of query results
function output_user_profile(res, login, userInfo, userInterests, userFriends, peopleWithSameInterests) {
	res.render('profile.jade',
		   { title: "Profile for User with login " + login,
			 userInfo: userInfo,
			 userInterests: userInterests,
			 userFriends: userFriends,
			 peopleWithSameInterests : peopleWithSameInterests}
	  );
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){
	var login = req.session.login;
	console.log("Current User:" + login);
	if(login){
		get_user_profile(res,login);
	}else{
		res.redirect('/');
	}
};
