var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var bcrypt = require('bcrypt');
var SALT_FACTOR = 10;

mongoose.set('debug', true);

var userSchema = new mongoose.Schema({
	email:{
		type:String,
		lowercase:true,
		required:true,
    unique:true
	},
	password:{
		type:String,
		required:true
	},
  meetupId:{
    type:Number
  },
  events:[{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }]
});

userSchema.plugin(findOrCreate);

userSchema.pre('save', function(next){

  var user = this;
  if(!user.isModified('password')){
  	return next();
  }

  return bcrypt.genSalt(SALT_FACTOR, function(err, salt){
	if(err){
		return next(err);
	}
	return bcrypt.hash(user.password, salt, function(err, hash) {
		if(err){
			return next(err);
		}
		user.password = hash;

		return next();
	});
  });
});




userSchema.statics.authenticate = function (formData, callback) {
  // this refers to the model!
  this.findOne({
      email: formData.email
    },
    function (err, user) {
      if (user === null){
        callback("Invalid username or password", null);
      }
      else {
        user.checkPassword(formData.password, callback);
      }

    });
};



userSchema.methods.checkPassword = function(password, callback) {
  var user = this;
  bcrypt.compare(password, user.password, function (err, isMatch) {
    if (isMatch) {
      callback(null, user);
    } else {
      callback(err, null);
    }
  });
};



var User = mongoose.model('User', userSchema);

module.exports = User;
