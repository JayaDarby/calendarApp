var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || "mongodb://localhost/calendarAuth");

module.exports.User = require('./user');
module.exports.Event = require('./event');
module.exports.Meetup = require('./meetup');