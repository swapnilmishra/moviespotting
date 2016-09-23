var commonModule = require('../common/common')
	,_ = require('underscore')
	,async = require('async')
	,mongoose = require('mongoose')
	,UserModel = require('../models/usermodel').getUserModel()
	,MovieModel = require('../models/moviemodel').getMovie();

exports.showPopularUsers = function(req,res){
	var query = UserModel.find();
	var userData = req.session.passport.user;

	UserModel.where('userId',userData.userId).findOne(function(error,userProfile){
		if(error){
			console.log(error);
		}
		else{
			query
			.sort({moviesCount:'desc'})
			.select('userId userDisplayName followers moviesCount wishListCount userDp')
			.exec(function(error,users){
				res.render('popularusers',{userData: userData, users: users, userProfile: userProfile});
			});
		}
	});
}

exports.showPopularMovies = function(req,res){
	var query = MovieModel.find();
	query
	.exec(function(error, movies){
		var sortedMovies = _.sortBy(movies, function(movie){
			return(movie.favorited.length);
		});
		res.render('popularmovies', {title:'Popular movies',userData: req.session.passport.user, movies: sortedMovies.reverse()});
	});
}

exports.showRecentMovies = function(req,res){
	var query = MovieModel.find();
	query
	.sort({creationDate:'desc'})
	.exec(function(error, movies){
		res.render('popularmovies', {title:'Recently shared movies',userData: req.session.passport.user, movies: movies});
	});
}