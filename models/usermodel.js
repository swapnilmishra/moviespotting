var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
			userId: String,
			userName: String,
			password: String,
			userDisplayName: String,
			userEmailId: String,
			following: Array,
			followers: Array,
			favoritedMovies:Array,
			moviesCount:Number,
			wishListCount: Number,
			userDp:String
})
var UserModel = mongoose.model('UserList',userSchema);

exports.getUserModel = function(){
	return UserModel;
}