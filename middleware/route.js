var db = require("../models");

var routeHelpers = {
  ensureLoggedIn: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      return next();
    }
    else {
     res.redirect('/login');
    }
  },

  ensureCorrectUser: function(req, res, next){
    db.Event.findById(req.params.id, function(err, event){
      if(event.user !== req.session.id){
        res.redirect('/events');
      }
      else{
        return next();
      }
    });
  }

  preventLoginSignup: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      res.redirect('/events');
    }
    else {
     return next();
    }
  }
};

module.exports = routeHelpers;