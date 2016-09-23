var commonModule = require('../common/common')
	,_ 	= require('underscore')
	,mongoose = require('mongoose')
	,async = require('async')
	,restler = require('restler')
	,UserModel = require('../models/usermodel').getUserModel()
	,MovieModel = require('../models/moviemodel').getMovie()
	,WishListModel = require('../models/wishlistmodel').getWishList()
	,ActivityStreamModel = require('../models/activitystreammodel').getActivityStream();

// create wishlist and add movie to it
// @params wishlist name,movieId
exports.createWishListWithMovie = function(req,res){
	console.log("/list/createwishlistaddmovie");
	var userData = req.session.passport.user;
	async.waterfall([
		// get latest sequence to assign a wishlist id
		function(callback){
			commonModule.getNextSequence('listId',function(seq){
				var wishListModel = new WishListModel({
		  			name: req.query.name,
					creatorId: userData.userId,
					creatorName: userData.userDisplayName,
					creationDate: new Date(),
					listId: seq,
					movies:[req.query.movieId]
	  			});
	  			callback(null,wishListModel);
			});
		},

		// save new wishlist
		function(wishListModel,callback){
			wishListModel.save(function(error,result){
				// find movie name to save in activity stream
				MovieModel.findOne({'movieId':req.query.movieId},'name',function(error,movie){

					commonModule.getNextSequence("actId",function(seq){
						// create activity stream model
						var activity = ActivityStreamModel({
							actId: seq,
							actor: {
								id: userData.userId, 	
								name: userData.userDisplayName
							},
							date: new Date(), 	
							verb: "added",		
							targetObj: {
								objType: "list", 	
								id: result.listId, 	
								name: result.name
							},
							metaObj: {
								id: req.query.movieId,
								name: movie.name
							}
						});
						//save activity stream
						activity.save(function(error,doc){
							console.log("activity saved");
							callback(null,result);
						});
					});
					
				});
  			});
		},

		function(result,callback){
			WishListModel.count({creatorId:userData.userId},function(error,count){
				if(error){ console.log("Error=>" + error);}
				else{
					UserModel.update({userId:userData.userId},{wishListCount:count},
						function(error,numberAffected,raw){
							if(error){ console.log("Error=>" + error);}
							callback(null,raw);
						}
					);
				}
			});
		}

	], function(error,result){
		if(error){
			console.log("Error==>" + error);
		}
		else{
			res.send(result);
		}
	});
}

// create wishlist
// @param name
exports.createWishList = function(req,res,addMovieCallback){

	var userData = req.session.passport.user;
	async.waterfall([
		// get latest sequence to assign a wishlist id
		function(callback){
			commonModule.getNextSequence('listId',function(seq){
				var wishListModel = new WishListModel({
					name: req.query.name,
					creatorId: userData.userId,
					creatorName: userData.userDisplayName,
					creationDate: new Date(),
					listId: seq,
					movies:[]
	  			});
	  			if(req.query.sysListType){
	  				wishListModel.sysListType = req.query.sysListType;
	  			}
	  			callback(null,wishListModel);
			});
		},

		// save new wishlist
		function(wishListModel,callback){
			wishListModel.save(function(error,result){
  				callback(null,result);
  			});
		},

		function(result,callback){
			WishListModel.count({creatorId:userData.userId},function(error,count){
				if(error){ console.log("Error=>" + error);}
				else{
					UserModel.update({userId:userData.userId},{wishListCount:count},
						function(error,numberAffected,raw){
							if(error){ console.log("Error=>" + error);}
							callback(null,result);
						}
					);
				}
			});
		}

	], function(error,result){
		if(error){
			console.log("Error==>" + error);
		}
		else{
			if(addMovieCallback){
				req.query.listId = result.listId;
				addMovieCallback(req,res);
			}
			else{
				res.send({wishlist:result});
			}
		}
	});

}

// add a movie to wishlist
//@params movieId,listId
exports.addMovieToWishList = function(req,res){

	var userData = req.session.passport.user;
	var query = req.query;
	var listType = !!query.sysListType ? "syslist" : "list";
	WishListModel.findOneAndUpdate(
		{$and: [{listId: query.listId},{creatorId: userData.userId}]},
		{$push: {movies:query.movieId}},
		function(error,wishlist){
			if(error){
				console.log("Error==>" + error);
			}
			else{
				res.send({status:"Added movie",msg:"Added movie",movieId: query.movieId});
				MovieModel.findOne({'movieId':query.movieId},'name',function(error,movie){
					commonModule.getNextSequence("actId",function(seq){
						var activity = ActivityStreamModel({
							actId: seq,
							actor: {
								id: userData.userId, 	
								name: userData.userDisplayName
							},
							date: new Date(), 	
							verb: "added",		
							targetObj: {
								objType: listType, 	
								id: query.listId, 	
								name: wishlist.name
							},
							metaObj: {
								id: query.movieId,
								name: movie.name
							}
						});
						activity.save(function(error,doc){
							console.log("activity saved");
						});
					});
				});
			}
		}
	);
}

// add movie to want to watch or watched list
//@params movieId,sysListType
exports.addMovieToSystemList = function(req,res){

	var userData = req.session.passport.user;
	var sysListType = req.query.sysListType;
	var listName;
	if(sysListType=="watched"){
		listName = "Watched";
		req.query.name = "Watched";
	}
	else{
		listName = "Want to watch";
		req.query.name = "Want to watch";	
	}

	WishListModel.findOne({"creatorId":userData.userId,"sysListType":sysListType},function(error,doc){
		// if list already exists
		if(doc){
			req.query.listId = doc.listId;
			//block to handle request coming from create movie
			if(req.query.isNewMovie){
				exports.addMovieToWishList(req,res);
				syncSysWishLists(userData.userId,sysListType,req.query.movieId);
			}
			// if request is from buttons
			else{
				if(_.contains(doc.movies,req.query.movieId)){
					res.send({status:("Psst, looks like you have already added this movie to " + doc.name + "List")});
				}
				else{
					exports.addMovieToWishList(req,res);
					syncSysWishLists(userData.userId,sysListType,req.query.movieId);
				}	
			}
		}
		// if list doesn't exists
		else{
			exports.createWishList(req,res,exports.addMovieToWishList);
			syncSysWishLists(userData.userId,sysListType,req.query.movieId);
		}
	});
}

function syncSysWishLists(userId,sysListType,movieId){
	var listType = "watched";
	if(sysListType == listType){
		listType = "wanttowatch";
	}
	WishListModel.findOne({"creatorId":userId,"sysListType":listType},function(error,doc){
		if(doc && doc.movies){
			if(_.contains(doc.movies,movieId)){
				console.log(listType + " also contain this movie");
				WishListModel.update(
					{$and:[{"creatorId":userId},{"sysListType":listType}]},
					{$pull:{movies:movieId}},
					function(error,numberAffected,raw){
						if(error){
							console.log("Error==>" + error);
						}
						console.log(numberAffected);
					}
				);
			}
		}
	});
}

// remove a movie from wishlist
//@params movieId,listId
exports.removeMovieFromWishList = function(req,res){

	var userData = req.session.passport.user;
	WishListModel.update(
		{$and: [{listId: req.query.listId},{creatorId: userData.userId}]},
		{$pull: {movies:req.query.movieId}},
		function(error,numberAffected,raw){
			if(error){
				console.log("Error==>" + error);
			}
			else{
				res.send({status:"success"});
			}
		}
	);
}

// @param movieId
exports.getWishLists = function(req,res){

	var userData = req.session.passport.user;
	WishListModel.where('creatorId',userData.userId).sort({'name':'asc'}).find(function(error,lists){
		if(error){
			console.log("Error==>" + error);
		}
		else{
			var listArray = []
				,tempListItem
				,containsMovie;
			_.each(lists,function(listItem){
				containsMovie = "n";
				if(_.contains(listItem.movies,req.query.movieId)){
					containsMovie = "y";
				}
				tempListItem = {
					name: listItem.name,
					listId: listItem.listId,
					containsMovie: containsMovie
				}
				listArray.push(tempListItem);
			});
			res.send(listArray);
		}
	});
}

exports.showWishLists = function(req,res){

	var userData = req.session.passport.user;

	async.series({

		userProfile: function(callback){
			UserModel.where('userId',req.route.params.userid).findOne(function(error,userProfile){
				callback(null,userProfile);
				//res.render('wishlist',{userData:userData,userProfile:userProfile,title:'Wishlists'});
			});
		},

		wishLists: function(callback){
			var query = WishListModel.find();
			query
			.where('creatorId',req.route.params.userid)
			.sort({'name':'asc'})
			.exec(function(error,wishLists){
				callback(null,wishLists);
			});
		}
	},
	function(error,result){
		var isFollowing = "n";
		if(_.contains(result.userProfile.followers,userData.userId)){
			isFollowing = "y";
		}
		res.render('wishlist',{
			userData:userData,
			userProfile:result.userProfile,
			wishLists:result.wishLists,
			title:'Lists',
			isFollowing: isFollowing
		});
	});
};

exports.showWishList = function(req,res){

	var userData = req.session.passport.user;
	var listId = req.route.params.listid;
	var listObj;

	async.waterfall([
		function(callback){
			WishListModel.where('listId', listId).findOne(function(error,list){
				listObj = list;
				callback(null,list);
			});
		},

		function(list,callback){
			var query = MovieModel.find();
			query.where('movieId')
				.in(list.movies)
				.sort({'creationDate':'desc'}).exec(function(error,movies){
					callback(null,movies)
				});
		}
	],function(error,movies){
		if(error){
			res.send("Error");
		}
		else {
			var resObj = {
				movies: movies,
				userData: userData,
				list: listObj
			}
			res.render('wishlistedmovies',resObj);
		}
	});
}





