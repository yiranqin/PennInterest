
/*
 * GET the login page, which is specified in Jade.
 */

exports.do_work = function(req, res) {
  res.render('newLogin.jade', {
    title: 'PennInterest' 
  });
};
