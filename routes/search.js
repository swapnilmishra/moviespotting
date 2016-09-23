var commonModule = require('../common/common')
	,_ 	= require('underscore')
	,mongoose = require('mongoose')
	,async = require('async')
	,UserModel = require('../models/usermodel').getUserModel()
	,MovieModel = require('../models/moviemodel').getMovie()
	,WishListModel = require('../models/wishlistmodel').getWishList();


// view for search page
exports.showMoviesByName = function(req,res){
	//console.log("searchByHashTag");
	var name = req.body.query;
	if(name == undefined) {
		name = "";
	}
	var userData = req.session.passport.user;
	var query = MovieModel.find();
	var re = new RegExp(name,"i");

	query.where('name').regex(re).exec(function(error,movies){
		if(error) { console.log("Error=>" + error); }
		var resData = {
			movies:movies,
			userData:userData,
			query:name,
			type: 'name'
		}
		res.render('search',resData);
		
	});
}

// handler for movie search by tag
exports.searchMoviesByTag = function(req,res){
	//console.log("searchByHashTag");
	var tag = req.route.params.query;
	if(tag == undefined) {
		tag = "";
	}
	var userData = req.session.passport.user;
	var query = MovieModel.find();
	var re = new RegExp(tag,"i");
	var pjax = false;
	if (req.header('X-PJAX')) {
      pjax = true;
    }

	query.where('associatedTags').regex(re).exec(function(error,movies){
		if(error) { console.log("Error=>" + error); }
		var resData = {
			movies:movies,
			userData:userData,
			query:tag,
			type: 'tag'
		}
		if(pjax){
			res.render('movietemplate',resData);
		}
		else{
			res.render('search',resData);
		}
	});
}

// handler for movie search by name
exports.searchMoviesByName = function(req,res){
	//console.log("searchByHashTag");
	var name = req.route.params.query;
	if(name == undefined){
		name = "";
	}
	var userData = req.session.passport.user;
	var query = MovieModel.find();
	var re = new RegExp(name,"i");
	var pjax = false;
	if (req.header('X-PJAX')) {
      pjax = true;
    }
	query.where('name').regex(re).exec(function(error,movies){
		if(error) { console.log("Error=>" + error) }
		var resData = {
			movies:movies,
			userData:userData,
			query:name,
			type: 'name'
		}
		if(pjax){
			res.render('movietemplate',resData);
		}
		else{
			res.render('search',resData);
		}
	});
}

exports.searchUsersByName = function(req,res){
	//console.log("searchByHashTag");
	var name = req.route.params.query;
	if(name == undefined){
		name = "";
	}
	var userData = req.session.passport.user;
	var query = UserModel.find();
	var re = new RegExp(name,"i");
	var pjax = false;
	if (req.header('X-PJAX')) {
      pjax = true;
    }
    UserModel.where('userId',userData.userId).findOne(function(error,userProfile){
    	if(error) {
    		console.log("Error=>" + error);
    	}
    	else{
    		query.or([{'userDisplayName':re},{'userName':re}]).exec(function(error,users){
				if(error) { console.log("Error=>" + error); }
				var resData = {
					users:users,
					userData:userData,
					query:name,
					userProfile: userProfile
				}
				if(pjax){
					res.render('searchusertemplate',resData);
				}
				else{
					res.render('searchuser',resData);
				}
			});
    	}
    });
}

exports.searchWishlists = function(req,res){
	var name = req.route.params.query;
	var userData = req.session.passport.user;
	var query = WishListModel.find();
	var re = new RegExp(name,"i");
	var pjax = false;
	if (req.header('X-PJAX')) {
      pjax = true;
    }
	query.where('name').regex(re).exec(function(error,lists){
		if(error) { console.log("Error=>" + error) }
		var resData = {
			wishLists:lists,
			userData:userData,
			query:name
		}
		if(pjax){
			res.render('searchwishlisttemplate',resData);
		}
		else{
			res.render('searchwishlists',resData);
		}
	});
}
