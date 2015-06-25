var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/auth");

module.exports.User = require('./user');