// Load required packages
var mongoose = require('mongoose');

mongoose.set('debug', true);

// Define our client schema
var meetupSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  id: { type: String, required: true },
  secret: { type: String, required: true },
  userId: { type: String, required: true }
});

// Export the Mongoose model
var Meetup = mongoose.model('Meetup', meetupSchema);
module.exports = Meetup;