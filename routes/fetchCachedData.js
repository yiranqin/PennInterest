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


/////
//pin new content on board to user
//
//res = HTTP result object sent back to the client
//login = user login to query for
function retrieve_and_send(res, url) {
  	// For debugging
  	console.log("Get Retreiving from Cache Request for: " + url);
  	
  	url.trim();
  	var extTypes = {
			  "bmp" : "image/bmp"
			, "jpeg" : "image/jpeg"
			, "jpg" : "image/jpeg"
			, "gif"  : "image/gif"	
			, "png" : "image/png"
			, "pdf" : "application/pdf"};
  	MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
		if(err) {
			console.log(err);
		}else{
			console.log("Mongo: We are connected");
			// Determine if the data is indeed cached
			GridStore.exist(db, url, function(err, result) {
 	    		assert.equal(null, err);
 	    		
 	    		// This is right case
 	    		if(result){
 	    			var i = url.lastIndexOf('.');
 	    			extension = ((url.length - i) >= 5) ? '' : url.substr(i + 1);
 	    			
 	    			var contentType = (extension != '') ? extTypes[extension.toLowerCase()] : 'application/octet-stream';
 	    			
 	    			console.log("Indeed in cache! Extension: " + extension + " Content Type: " + contentType);
 	    			
 	    			GridStore.read(db, url, function(err, fileData) {
 	    				  assert.equal(null,err);
 	    				  if(err){
 	    					  console.log(err);
 	    					  db.close();
 	    				  }else{
 	    					 res.writeHead(200, {
	                            'Content-Type': contentType,
	                            'Content-Length':fileData.length});

	                        console.log("File length is " +fileData.length);
	                        res.write(fileData, "binary");
	                        res.end(fileData,"binary");
	                        console.log("Done Sending the data for URL: " + url);
	                        db.close();
 	    				 }
 	    			});
 	    		}
 	    		//Error case, redo caching and send from server, assuming this is rare
 	    		else{
 	    			console.log(url + " : not really cached, redo caching");
 	    			// Redo the caching
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
	 	   				                    	  console.log("done storing: " + url +" to MongoDB");
	 	   				                    	  
	 	   				 	    			
	 	   				                    	  var i = url.lastIndexOf('.');
	 	   				                    	  extension = ((url.length - i) >= 5) ? '' : url.substr(i + 1);
	 	   				                    	  var contentType = (extension != '') ? extTypes[extension.toLowerCase()] : 'application/octet-stream';
		 	   				 	    			
	 	   				                    	  console.log("Indeed in cache! Extension: " + extension + " Content Type: " + contentType);
		 	   				 	    			
	 	   				                    	  GridStore.read(db, url, function(err, fileData) {
	 	   				                    		  assert.equal(null,err);
		 	   				 	    				  if(err){
		 	   				 	    					  console.log(err);
		 	   				 	    					  db.close();
		 	   				 	    				  }else{
		 	   				 	    					 res.writeHead(200, {
		 	   					                            'Content-Type': contentType,
		 	   					                            'Content-Length':fileData.length});
	
		 	   					                        console.log("File length is " +fileData.length);
		 	   					                        res.write(fileData, "binary");
		 	   					                        res.end(fileData,"binary");
		 	   					                        console.log("Done Sending the data for URL: " + url);
		 	   					                        db.close();
		 	   				 	    				 }
		 	   				 	    			});
	 	   			                    	  });
	 	   			                      });
	 	   		                    });
	 	   		      	  		});
	 	   				});
	 	   			});
 	    			
 	    		} 	    		
 	    	 });// end exist 
		}// end else
	});
	
}

/////
// This is what's called by the main app 
exports.do_work = function(req, res){
	console.log("Routed to me");
	retrieve_and_send(res,req.query.url);
};
