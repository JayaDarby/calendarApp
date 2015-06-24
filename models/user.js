var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_FACTOR = 10;


var userSchema = new mongoose.Schema({
	email:{
		type:String,
		lowercase:true,
		required:true
	},
	password:{
		type:String,
		required:true
	},
});

var User = mongoose.model('User', userSchema);

