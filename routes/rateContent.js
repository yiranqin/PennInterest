// Connect string to Oracle
var connectData = { 
  "hostname": "cis550-project-oracle.cwk0ivvhztba.us-east-1.rds.amazonaws.com", 
  "user": "cis550project", 
  "password": "cis550project", 
  "database": "oracle" };
var oracle =  require("oracle");
//for mongodb
var fs = require('fs');
var request = require('request');
var http = require('http');
var Db = require('mongodb').Db,
MongoClient = require('mongodb').MongoClient,
Server = require('mongodb').Server,
ReplSetServers = require('mongodb').ReplSetServers,
ObjectID = require('mongodb').ObjectID,
Binary = require('mongodb').Binary,
GridStore = require('mongodb').GridStore,
Grid = require('mongodb').Grid,
Code = require('mongodb').Code,
BSON = require('mongodb').pure().BSON,
assert = require('assert');


function doCache(url){
	MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
		if(err) {
			console.log(err);
			res.send(res, "");
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
//add new board to user
//
//res = HTTP result object sent back to the client
//login = user login to query for
function rate_content(res, login, objectIDStr, sourceID, scoreStr) {
  	// For debugging
  	console.log("Rate Content for User: " + login + " objectID: " + objectIDStr + " sourceID: " + sourceID + " score: " + scoreStr);
  	
  	login.trim();
  	scoreStr.trim();
  	objectIDStr.trim();
  	sourceID.trim();
  	var objectID = parseInt(objectIDStr);
  	var score = parseInt(scoreStr);
  	if(score > 5)
  		score = 5;
  	else if(score < 1)
  		score = 1;
  	
	oracle.connect(connectData, function(err, connection) {
	 if ( err ) {
	 	console.log(err);
	 	return_login(res);
	 } else {
	  	// insert content
	  	connection.execute("INSERT INTO Rating VALUES("+objectID+", '"+sourceID+"','"+login+"', "+score+")",
	  			   [], 
	  			   function(err, results) {
	  	    if ( err ) {
	  	    	console.log(err);
	  	    	// update content
	  		  	connection.execute("UPDATE Rating SET score = "+ score +" WHERE objectID=" + objectID + " and sourceID='" + sourceID + "' and userID = '"+ login +"'",
	  		  			   [], 
	  		  			   function(err, results) {
	  		  		console.log("Update Rating for User: " + login + " objectID: " + objectIDStr + " sourceID: " + sourceID + " score: " + score);
	  		  	    if ( err ) {
	  		  	    	console.log(err);
		  		  	    connection.close();
			  	    	return_login(res);
	  		  	    }else{
	  		  	    	// update content
	  		  		  	connection.execute("SELECT Obj.objectid, Obj.sourceId, Obj.url, Obj.objectType, Obj.cacheFlag, partObj.avgscore, partObj.tags FROM (Select avgRating.*, tags From (Select objectID, sourceID, Round(AVG(score),2) as avgscore From Rating Where objectID=" + objectID + " and sourceID='" + sourceID + "' Group by objectID, sourceID) avgRating  left outer join (SELECT objectID, sourceID, LISTAGG(tag, ',') WITHIN GROUP (ORDER BY tag) AS tags FROM Tag Where objectID=" + objectID + " and sourceID='" + sourceID + "' GROUP BY objectID, sourceID) ObjTags on avgRating.objectId = ObjTags.objectId and avgRating.sourceId = ObjTags.sourceId) partObj, Obj where partObj.objectID = Obj.objectID and partObj.sourceID= Obj.sourceID",
	  		  		  			   [], 
	  		  		  			   function(err, results) {
	  		  		  		console.log("Retrieve the updated Info for objectID: " + objectIDStr + " sourceID: " + sourceID + " updatedScore: " + results[0].AVGSCORE);
	  		  		  		
	  		  		  	    if ( err ) {
	  		  		  	    	console.log(err);
	  		  		  	    }
	  		  		  	    
		  		  		  	connection.close();
				  	    	return_login(res, results);
	  		  		  	});
	  		  	    }
		  	    	
	  		  	});
	  	    }
	  	    else{
		  	    // check if the content should be cached
	  		  	connection.execute("SELECT Obj.objectid, Obj.sourceId, Obj.url, Obj.objectType, Obj.cacheFlag, partObj.avgscore, partObj.tags FROM (Select avgRating.*, tags From (Select objectID, sourceID, Round(AVG(score),2) as avgscore From Rating Where objectID=" + objectID + " and sourceID='" + sourceID + "' Group by objectID, sourceID) avgRating  left outer join (SELECT objectID, sourceID, LISTAGG(tag, ',') WITHIN GROUP (ORDER BY tag) AS tags FROM Tag Where objectID=" + objectID + " and sourceID='" + sourceID + "' GROUP BY objectID, sourceID) ObjTags on avgRating.objectId = ObjTags.objectId and avgRating.sourceId = ObjTags.sourceId) partObj, Obj where partObj.objectID = Obj.objectID and partObj.sourceID= Obj.sourceID",
			  			   [], 
			  			   function(err, results) {
			  	    if ( err ) {
			  	    	console.log(err);
			  	    	connection.close();
			  	    	res.send(res, "");
			  	    }
			  	    else{
				  	    var flagValue = parseInt(results[0].CACHEFLAG);
				  	    console.log("CacheFlag: " + flagValue + " for objectID: " + objectID + " sourceID: " + sourceID + " updatedScore: " + results[0].AVGSCORE);
				  	    
				  	    flagValue++;
				  	    if(flagValue >= 5 && (results[0].OBJECTTYPE == "photo" || results[0].OBJECTTYPE == "pdf")){
				  	    	console.log("Caching Object");
				  	    	doCache(results[0].URL);
				  	    }
				  	    
					  	// update content cacheFlag
					  	connection.execute("UPDATE Obj SET cacheFlag = " + flagValue + " WHERE Obj.objectID='" + objectID + "' and Obj.sourceID='" + sourceID + "'",
						  			   [], 
						  			   function(err, newresults) {
						  	    if ( err ) {
						  	    	console.log(err);
						  	    }
						  	  connection.close();
						  	  return_login(res, results);
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
function return_login(res, results) {
	console.log(results);
	res.send(results);
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){	
	var login = req.session.login;
	console.log("Current User:" + login + req.query.objectID + " " +req.query.sourceID + " " + req.query.rateValue);
	if(login){
		rate_content(res, login, req.query.objectID, req.query.sourceID, req.query.rateValue);
	}else{
		res.redirect('/');
	}	
	
};
