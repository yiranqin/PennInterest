/*
 * GET home page, which is specified in Jade.
 */

exports.do_work = function(req, res) {
	// Check if user has already logged in
	// if not render login page
//	if(!req.session.login){
	  res.render('index.jade', {
		  title: 'PennInterest' 
	  });
//	}
//	// if already logged in, redirect to the profile page
//	else{
//		res.redirect('/');
//	}
};