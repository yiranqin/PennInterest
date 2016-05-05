/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , login = require('./routes/login')
  , renderLogin = require('./routes/renderLogin')
  , renderRegister = require('./routes/renderRegister')
  , register = require('./routes/register')
  , userProfile = require('./routes/userProfile')
  , userBoards = require('./routes/userBoards')
  , userContents = require('./routes/userContents')
  , addBoard = require('./routes/addBoard')
  , addInterest = require('./routes/addInterest')
  , addFriend = require('./routes/addFriend')
  , addTag = require('./routes/addTag')
  , addContent = require('./routes/addContent')
  , userBoardContents = require('./routes/userBoardContents')
  , recommend = require('./routes/recommend')
  , rateContent = require('./routes/rateContent')
  , renderPinPage = require('./routes/renderPinPage')
  , pinContent = require('./routes/pinContent')
  , updatePasswords = require('./routes/updatePasswords')
  , renderReset = require('./routes/renderReset')
  , logout = require('./routes/logout')
  , fetchCachedData = require('./routes/fetchCachedData')
  , search = require('./routes/search')
  , bingsearch = require('./routes/bingsearch')
  , renderPinNewcontent = require('./routes/renderPinNewcontent')
  , http = require('http')
  , path = require('path')
  , stylus =  require("stylus")
  , nib =     require("nib")
;

// Initialize express
var app = express();
// .. and our app
init_app(app);

// When we get a request for {app}/ we should call routes/index.js
app.get('/', routes.do_work);
// when we get a request for {app/login} we should call routes/login.js
app.get('/login', login.do_work);
//when we get a request for {app/renderLogin} we should call routes/renderLogin.js
app.get('/renderLogin', renderLogin.do_work);
//when we get a request for {app/register} we should call routes/register.js
app.get('/register', register.do_work);
//when we get a request for {app/renderRegister} we should call routes/renderRegister.js
app.get('/renderRegister', renderRegister.do_work);
//when we get a request for {app/userProfile} we should call routes/userProfile.js
app.get('/userProfile', userProfile.do_work);
//when we get a request for {app/userBoards} we should call routes/userBoards.js
app.get('/userBoards', userBoards.do_work);
//when we get a request for {app/userBoardContents} we should call routes/userBoardContents.js
app.get('/userBoardContents', userBoardContents.do_work);
//when we get a request for {app/userContents} we should call routes/userContents.js
app.get('/userContents', userContents.do_work);
//when we get a request for {app/pinContent} we should call routes/pinContent.js
app.get('/pinContent', pinContent.do_work);
//when we get a request for {app/recommend} we should call routes/recommend.js
app.get('/recommend', recommend.do_work);
//when we get a request for {app/updatePasswords} we should call routes/updatePasswords.js
app.get('/updatePasswords', updatePasswords.do_work);
//when we get a request for {app/renderReset} we should call routes/renderReset.js
app.get('/renderReset', renderReset.do_work);
//when we get a request for {app/addBoard} we should call routes/addBoard.js
app.get('/addBoard', addBoard.do_work);
//when we get a request for {app/addInterest} we should call routes/addInterest.js
app.get('/addInterest', addInterest.do_work);
//when we get a request for {app/addFriend} we should call routes/addFriend.js
app.get('/addFriend', addFriend.do_work);
//when we get a request for {app/addTag} we should call routes/addTag.js
app.get('/addTag', addTag.do_work);
//when we get a request for {app/addContent} we should call routes/addContent.js
app.get('/addContent', addContent.do_work);
//when we get a request for {app/renderPinPage} we should call routes/renderPinPage.js
app.get('/renderPinPage', renderPinPage.do_work);
//when we get a request for {app/rateContent} we should call routes/rateContent.js
app.get('/rateContent', rateContent.do_work);
//when we get a request for {app/logout} we should call routes/logout.js
app.get('/logout', logout.do_work);
//when we get a request for {app/fetchCachedData} we should call routes/fetchCachedData.js
app.get('/fetchCachedData', fetchCachedData.do_work);
//when we get a request for {app/search} we should call routes/search.js
app.get('/search', search.do_work);
//when we get a request for {app/bingsearch} we should call routes/bingsearch.js
app.get('/bingsearch', bingsearch.do_work);
//when we get a request for {app/renderPinNewcontent} we should call routes/renderPinNewcontent.js
app.get('/renderPinNewcontent', renderPinNewcontent.do_work);

// Listen on the port we specify
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

///////////////////
// This function compiles the stylus CSS files, etc.
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}

//////
// This is app initialization code
function init_app() {
	var MemoryStore = require('connect').session.MemoryStore;
	app.use(express.cookieParser());
	app.use(express.session({ 
	    secret: "Group Champion CIS550", 
	    store: new MemoryStore({ 
	        reapInterval: 60000 * 10
	    })
	}));
	
	
	// all environments
	app.set('port', process.env.PORT || 8080);
	
	// Use Jade to do views
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');

	app.use(express.favicon());
	// Set the express logger: log to the console in dev mode
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
//	app.use(express.cookieParser("thissecretrocks"));
	app.use(app.router);
	// Use Stylus, which compiles .styl --> CSS
	app.use(stylus.middleware(
	  { src: __dirname + '/public'
	  , compile: compile
	  }
	));
	app.use(express.static(path.join(__dirname, 'public')));

	// development only
	if ('development' == app.get('env')) {
	  app.use(express.errorHandler());
	}

}