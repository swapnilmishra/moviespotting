var mongoose = require('mongoose');

var wishListSchema = mongoose.Schema({
	name: String,
	creatorId: String,
	creatorName: String,
	creationDate: Date,
	listId: String,
	movies:Array,
	sysListType: String
});

var WishList = mongoose.model('WishList',wishListSchema);

exports.getWishList = function(){
	return WishList;
}