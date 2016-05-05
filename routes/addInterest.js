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
function add_user_interest(res, login, interest) {
  	// For debugging
  	console.log("Add New Interest for User: " + login + " interest: " + interest);
  	
  	login.trim();
  	interest.trim();
	oracle.connect(connectData, function(err, connection) {
		 if ( err ) {
		 	console.log(err);
		 	return_login(res, "");
		 } else {
                                if(interest != ""){
                                        var interestsList = interest.split(",");
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
                                                return_login(res, interest);
                                }); // end connection.execute
                                }else{
                                        connection.close();
                                        return_login(res, "");
                                }

		 }
	}); // end oracle.connect
}

/////
//Return to the login page
//
//res = HTTP result object sent back to the client
function return_login(res, interest) {
	res.send(interest);
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){		
	var login = req.session.login;
	console.log("Current User:" + login);
	if(login){
		add_user_interest(res,login, req.query.interestname);
	}else{
		res.redirect('/');
	}
};
