
/*
 * GET the register page, which is specified in Jade.
 */

exports.do_work = function(req, res) {
  res.render('reset.jade', {
    title: 'PennInterest' 
  });
};
