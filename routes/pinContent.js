// Connect string to Oracle
var connectData = { 
  "hostname": "cis550-project-oracle.cwk0ivvhztba.us-east-1.rds.amazonaws.com", 
  "user": "cis550project", 
  "password": "cis550project", 
  "database": "oracle" };
var oracle =  require("oracle");

function doCache(url){
	MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
		if(err) {
			console.log(err);
			res.send("Problem pinning this content! :(");
		}else{
			console.log("Mongo: We are connected");
			// Determine if the data has already been cached
			GridStore.exist(db, url, function(err, result) {
 	    		assert.equal(null, err);
 	    		
 	    		// Only store it when it is not cached
 	    		if(!result){
 	    			console.log("Caching: "+url);
 	    			
	 	    		// Create a new instance of the gridstore
	 	   			var gridStore = new GridStore(db, url, 'w');
	 	   			// Open the file
	 	   			gridStore.open(function(err, gridStore) {
	 	   				if(err)
	 	   					console.log("err open gridStore Instance For: " + url);
	 	   					res.send("Problem pinning this content! :(");
	 	   	
	 	   				http.get(url, function (response) {	      	  
	 	   		      	  		response.setEncoding('binary');
	 	   		      	  		var image2 = '';
	 	   		            	  
	 	   		      	  		console.log('reading data in chunks first');
	 	   		      	  		response.on('data', function(chunk){
	 	   		      	  	        image2 += chunk;
	 	   		          	  		console.log('reading data');
	 	   		      	  	    });
	 	   		      	  		
	 	   		      	  		response.on('end', function() {
	 	   		      	  			console.log('done reading data');		
	 	   		                    image = new Buffer(image2,"binary");
	 	   			                    
	 	   		                    // Write some data to the file
	 	   		                    gridStore.write(image, function(err, gridStore) {
	 	   			                      assert.equal(null, err);
	 	   			
	 	   			                      // Close (Flushes the data to MongoDB)
	 	   			                      gridStore.close(function(err, result) {
	 	   			                    	  assert.equal(null, err);
	 	   			                    	  
	 	   			                    	  // Verify the file exists
	 	   			                    	  GridStore.exist(db, url, function(err, result) {
	 	   			                    		  assert.equal(null, err);
	 	   				                    	  assert.equal(true, result);
	 	   				                    	  db.close();
	 	   				                    	  console.log("done storing: " + url +" to MongoDB");
	 	   			                    	  });
	 	   			                      });
	 	   		                    });
	 	   		      	  		});
	 	   				});
	 	   			});
 	    		    
 	    		}else{
 	    			console.log(url + " : has already been cached");
 	    			db.close();
 	    		} 	    		
 	    	 });// end exist 
		}// end else
	});
}

/////
//pin new content on board to user
//
//res = HTTP result object sent back to the client
//login = user login to query for
function pin_board_content(res, login, boardName, objectIDStr, sourceID) {
  	// For debugging
  	console.log("Pin New Content for User: " + login + " on board: " + boardName + " objectID: " + objectIDStr + " sourceID: " + sourceID);
  	
  	login.trim();
  	boardName.trim();
  	objectIDStr.trim();
  	sourceID.trim();
  	var objectID = parseInt(objectIDStr);
	oracle.connect(connectData, function(err, connection) {
	 if ( err ) {
	 	console.log(err);
	 	res.send("Problem pinning this content! :(");
	 } else {
	  	// insert content
	  	connection.execute("INSERT INTO Pin VALUES("+objectID+", '"+sourceID+"','"+login+"', '"+boardName+"')",
	  			   [], 
	  			   function(err, results) {
	  	    if ( err ) {
	  	    	console.log(err);
	  	    	connection.close();
	  	    	res.send("Problem pinning this content! :(");
	  	    }
	  	    else{
		  	    // check if the content should be cached
			  	connection.execute("SELECT Obj.* FROM Obj WHERE Obj.objectID=" + objectID + " and Obj.sourceID='" + sourceID + "'",
			  			   [], 
			  			   function(err, results) {
			  	    if ( err ) {
			  	    	console.log(err);
			  	    	connection.close();
			  	    	res.send("Problem pinning this content! :(");
			  	    }
			  	    else{
				  	    var flagValue = parseInt(results[0].CACHEFLAG);
				  	    console.log("CacheFlag: " + flagValue + " for objectID: " + objectID + " sourceID: " + sourceID);
				  	    
				  	    flagValue++;
				  	    if(flagValue >= 5 && (results[0].OBJECTTYPE == "photo" || results[0].OBJECTTYPE == "pdf")){
				  	    	console.log("Found a Candidate to be Cached");
				  	    	doCache(results[0].URL);
				  	    }
				  	    
					  	// update content cacheFlag
					  	connection.execute("UPDATE Obj SET cacheFlag = " + flagValue + " WHERE Obj.objectID='" + objectID + "' and Obj.sourceID='" + sourceID + "'",
						  			   [], 
						  			   function(err, results) {
						  	    if ( err ) {
						  	    	console.log(err);
						  	    	res.send("Problem pinning this content! :(");
						  	    }
						  	  connection.close();
						  	  return_login(res);
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
function return_login(res) {
	console.log("success");
	res.send("Success!");
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){	
	var login = req.session.login;
	console.log("Current User:" + login);
	if(login){
		pin_board_content(res,login, req.query.pinBoard, req.query.objectID, req.query.sourceID);
	}else{
		res.redirect('/');
	}	
};
