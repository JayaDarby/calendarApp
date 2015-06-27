var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/calendarAuth");

module.exports.User = require('./user');
module.exports.Event = require('./event');