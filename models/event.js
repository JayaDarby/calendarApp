var mongoose = require('mongoose');

mongoose.set('debug', true);

var eventSchema = new mongoose.Schema({
	title: {
		type:String,
		required: true
	},
	allDay: {
		type: Boolean
	},
	start: {
		type: String,
		required:true
	},
	end: {
		type: String
	},
	url: {
		type: String
	},
	description: {
		type: String
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
});

var Event = mongoose.model('Event', eventSchema);
module.exports = Event;