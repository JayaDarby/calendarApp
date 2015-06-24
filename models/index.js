var mongoose = requre('mongoose');
mongoose.connect("mongodb://localhost/auth");

module.exports.User = requre('./user');