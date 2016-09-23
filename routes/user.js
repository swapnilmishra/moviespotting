var commonModule = require('../common/common')
	,_ = require('underscore')
	,async = require('async')
	,mongoose = require('mongoose')
	,UserModel = require('../models/usermodel').getUserModel()
	,MovieModel = require('../models/moviemodel').getMovie()
	,ActivityStreamModel = require('../models/activitystreammodel').getActivityStream();

exports.showUserProfile = function(req,res){

	var userData = req.session.passport.user;

	UserModel.where('userId',userData.userId).findOne(function(error,userProfile){

		commonModule.getMoviesByUserId(req,userProfile.userId,function(movies){

			res.render('userprofile',{
				userProfile: userProfile,
				userData: userData,
				movies: movies,
				totalMovies: movies.length,
				title:'Movies Created'
			});
		});
	});
}

exports.showAnyUserProfile = function(req,res){


	var userData = req.session.passport.user;
	var userId = req.route.params.userid;
	var userData = req.session.passport.user;

	UserModel.where('userId',userId).findOne(function(error,userProfile){
		var isFollowing = "n";
		if(_.contains(userProfile.followers,userData.userId)){
			isFollowing = "y";
		}

		commonModule.getMoviesByUserId(req,userProfile.userId,function(movies){

			res.render('userprofile',{
				userProfile: userProfile,
				userData: userData,
				movies: movies,
				totalMovies: movies.length,
				title:'Movies Created',
				isFollowing: isFollowing
			});
		});
	});

}

exports.showFavoriteMovies = function(req,res){

	var userData = req.session.passport.user;
	var userId = req.params.userid;

	MovieModel.count({creatorId:userId},function(error,count){

		UserModel.where('userId',userId).findOne(function(error,userProfile){
			var isFollowing = "n";
			if(_.contains(userProfile.followers,userData.userId)){
				isFollowing = "y";
			}

			var query = MovieModel.find();
			query
			.where('movieId').in(userProfile.favoritedMovies)
			.sort({creationDate: 'desc'})
			.exec(function(err,movies){
				if(err){
					console.log("Error: " + err);
				}
				res.render('userprofile',{
					userProfile: userProfile,
					userData: userData,
					movies: movies,
					totalMovies: count,
					title: 'Movies Favorited',
					isFollowing: isFollowing
				});
			});
		});
	});
}

exports.showUserFollowers = function(req,res){

	var userData = req.session.passport.user;
	var userId = req.params.userid;

	MovieModel.count({creatorId:userId},function(error,count){

		if(userData.userId === userId){

			UserModel.where('userId',userId).findOne(function(error,doc){
	
			var userProfile = doc;
			var isFollowing = "n";
			if(_.contains(userProfile.followers,userData.userId)){
				isFollowing = "y";
			}
			// get common userids from followers and following
			var commonFollowers = _.intersection(userProfile.followers,userProfile.following);

			var query = UserModel.find();

			query
			.where('userId').in(userProfile.followers)
			.select('userDisplayName userId moviesCount followers userDp wishListCount')
			.exec(function(error,followerData){
				var followerDataFinal = [];
				var tempItem;
				// find common people among followers whom user is following
				_.each(followerData,function(item){
					tempItem = {
						userDisplayName: item.userDisplayName,
						userId: item.userId,
						moviesCount: item.moviesCount,
						followers: item.followers,
						userDp: item.userDp
					};
					if(_.contains(commonFollowers,item.userId)){
						tempItem.isFollowing = "y";
						followerDataFinal.push(tempItem);
					}
					else{
						tempItem.isFollowing = "n";
						followerDataFinal.push(tempItem);	
					}
				});

				res.render('userfollowers',{
					userProfile: userProfile,
					userData: userData,
					followers: followerDataFinal,
					totalMovies: count,
					title: "Followers",
					isFollowing: isFollowing
				});
			});
		});

		}// end if
		else {

			UserModel.where('userId',userId).findOne(function(error,doc){
	
				var userProfile = doc;
				var isFollowing = "n";
				if(_.contains(userProfile.followers,userData.userId)){
					isFollowing = "y";
				}
				UserModel
				.where('userId',userData.userId)
				.findOne(function(error,loggedInUser){
					// get common userids from followers and following
					var commonFollowers = _.intersection(userProfile.followers,loggedInUser.following);

					var query = UserModel.find();

					query
					.where('userId').in(userProfile.followers)
					.select('userDisplayName userId moviesCount followers userDp')
					.exec(function(error,followerData){
						var followerDataFinal = [];
						var tempItem;

						// find common people among followers whom user is following
						_.each(followerData,function(item){
							tempItem = {
								userDisplayName: item.userDisplayName,
								userId: item.userId,
								moviesCount: item.moviesCount,
								followers: item.followers,
								userDp: item.userDp
							};
							if(_.contains(commonFollowers,item.userId)){
								tempItem.isFollowing = "y";
								followerDataFinal.push(tempItem);
							}
							else{
								tempItem.isFollowing = "n";
								followerDataFinal.push(tempItem);	
							}
						});

						res.render('userfollowers',{
							userProfile: userProfile,
							userData: userData,
							followers: followerDataFinal,
							totalMovies: count,
							title: "Followers",
							isFollowing: isFollowing
						});
					});
				});
			});
		} // end else
	});
}

exports.showUserFollowings = function(req,res){

  		var userData = req.session.passport.user;
  		var userId = req.params.userid;

  		MovieModel.count({creatorId:userId},function(error,count){

  			UserModel.where('userId',userId).findOne(function(error,doc){
			
				var userProfile = doc;
				var query = UserModel.find();
				var followingDataFinal = [];
				var isFollowing = "n";
				if(_.contains(userProfile.followers,userData.userId)){
					isFollowing = "y";
				}

				UserModel.where('userId',userData.userId)
				.findOne(function(error,loggedInUser){

					var commonFollowing = _.intersection(userProfile.following,loggedInUser.following);

					query
					.where('userId').in(userProfile.following)
					.select('userDisplayName userId moviesCount followers userDp wishListCount')
					.exec(function(error,followingData){

						var tempItem;
						// find common people among followers whom user is following
						_.each(followingData,function(item){
							tempItem = {
								userDisplayName: item.userDisplayName,
								userId: item.userId,
								moviesCount: item.moviesCount,
								followers: item.followers,
								userDp: item.userDp
							};
							if(_.contains(commonFollowing,item.userId)){
								tempItem.isFollowing = "y";
								followingDataFinal.push(tempItem);
							}
							else{
								tempItem.isFollowing = "n";
								followingDataFinal.push(tempItem);	
							}
						});

						res.render('userfollowing',{
							userProfile: userProfile,
							userData: userData,
							followings: followingDataFinal,
							totalMovies: count,
							title: "Following",
							isFollowing: isFollowing
						});
					});
				})
			});
		});
}

exports.followUser = function(req,res){

	var userData = req.session.passport.user
		, query = req.query
		, conditions = { userId: userData.userId }
	  	, update = { $push : { following : query.followUserId }}
	  	, options = { multi: true };

	UserModel.update(conditions, update, options, function(error, numberAffected, raw){
		if(error){
			console.log("error while updating");
			res.send({message: "error"});
		}
		else{
			console.log("followed user");
			updateFollowing();
		}
	});

	var updateFollowing = function(){

		var conditions = { userId: query.followUserId }
		  	, update = { $push : { followers : userData.userId }}
		  	, options = { select:'userDisplayName'};

		UserModel.findOneAndUpdate(conditions, update, options, function(error, doc){
			if(error){
				console.log("error while updating==>" + error);
				res.send({message: "error"});
			}
			else{
				console.log("updated following");
				res.send({message: "success"});
				// update activity stream
				commonModule.getNextSequence("actId",function(seq){
					var activity = ActivityStreamModel({
						actId: seq,
						actor: {
							id: userData.userId,
							name: userData.userDisplayName
						},
						date: new Date(), 	
						verb: "followed",		
						targetObj: {
							objType: "user", 	
							id: query.followUserId, 	
							name: doc.userDisplayName
						}
					});
					activity.save(function(error,doc){
						console.log("activity saved");
					});
				});
			}
		});
	}
}

exports.unfollowUser = function(req,res){

	var conditions = { userId: req.session.passport.user.userId }
	  	, update = { $pull : { following : req.query.followUserId }}
	  	, options = { multi: true };

	UserModel.update(conditions, update, options, function(error, numberAffected, raw){
		if(error){
			console.log("error while updating");
		}
		else{
			console.log("followed user");
			updateFollowing();
		}
	});

	var updateFollowing = function(){

		var conditions = { userId: req.query.followUserId }
		  	, update = { $pull : { followers : req.session.passport.user.userId }}
		  	, options = { multi: true };

		UserModel.update(conditions, update, options, function(error, numberAffected, raw){
			if(error){
				console.log("error while updating==>" + error);
				res.send({message: "error"});
			}
			else{
				console.log("updated following");
				res.send({message: "success"});
			}
		});
	}
}

exports.removeProfilePic = function(req,res){
	var userData = req.session.passport.user;

	UserModel.update(
  	{ userId:userData.userId },
  	{ $set: {userDp:''} },
  	function(err,numRecords,raw){
    	if(err) {console.log(err);}
    	else {
      		console.log('Removed profie image for user');
      		res.redirect('/user/showuserprofile');
    	}
  	});

}

exports.checkNewActivity = function(req,res){
	var userData = req.session.passport.user;
	var query;

	UserModel.where('userId',userData.userId).findOne(function(error,userProfile){

		async.series({
			actorData: function(callback){
				query = ActivityStreamModel.find();
				query
				.where('actor.id')
				.in(userProfile.following)
				.where('userRead')
				.nin([userProfile.userId])
				.sort({date: 'desc'})
				.select('actId')
				.exec(function(error,stream){
					callback(null,stream);
				});
			},
			targetData: function(callback){
				query = ActivityStreamModel.find();
				query
				.and([{'targetObj.id': userData.userId},{'targetObj.objType': 'user'}])
				.where('userRead')
				.nin([userProfile.userId])
				.select('actId')
				.exec(function(error,stream){
					callback(null,stream);
				});
			}
		},
		function(error,result){
			var activitystream = result.actorData;
			if(activitystream ){
				if(result.targetData){
					activitystream = activitystream.concat(result.targetData);
				}
				activitystream = _.uniq(activitystream,false, function(item){
					return item.actId;
				});
				console.log(activitystream.length);
				res.send({length:activitystream.length});
			}
			else{
				res.send({length:0});
			}
		});
	});
}

exports.showActivityStream = function(req,res){
	var userData = req.session.passport.user;
	var query;
	UserModel.where('userId',userData.userId).findOne(function(error,userProfile){

		async.series({
			actorData: function(callback){
				query = ActivityStreamModel.find();
				query
				.where('actor.id')
				.in(userProfile.following)
				.exec(function(error,stream){
					callback(null,stream);
				});
			},
			targetData: function(callback){
				query = ActivityStreamModel.find();
				query
				.and([{'targetObj.id': userData.userId},{'targetObj.objType': 'user'}])
				.exec(function(error,stream){
					callback(null,stream);
				});
			}
		},
		function(error,result){
			var activitystream = result.actorData;
			activitystream = activitystream.concat(result.targetData);
			// sort activity stream
			var sortedActStream = _.sortBy(activitystream,function(item){
				return item.date;
			})
			// remove duplicate entriess based on actId
			var uniqueActivity = _.uniq(sortedActStream, true, function(item){
				return item.actId;
			});
			res.render('activitystream',{userData:userData,stream:uniqueActivity.reverse()});
		});
	});
}

exports.clearNewActivities = function(req,res){
	
	var activityIds = req.query.activityIds;
	var userData = req.session.passport.user;
	/*
	var query = ActivityStreamModel.find();
	query
	.where('actId')
	.in(activityIds.split(","))
	.update({},function(error,doc){
		res.send(doc);
	});
	*/

	var conditions = { actId : { $in : activityIds.split(",") } }
	  	, update = { $push : { userRead : userData.userId }}
	  	, options = { multi: true };

	ActivityStreamModel.update(conditions, update, options, function(error, numberAffected, raw){
		if(error){
			console.log("error while updating==>" + error);
			res.send({message: "error"});
		}
		else{
			console.log("updated activity");
			res.send({message: "success", numberAffected: numberAffected});
		}
	});

}

