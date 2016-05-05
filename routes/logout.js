
/*
 * GET home page, which is specified in Jade.
 */

exports.do_work = function(req, res) {
	// Check if user has already logged in
	// destroy session
	if (req.session.login) {
		req.session.destroy();
	}

	// redirect to root 
	res.redirect('/');
};
