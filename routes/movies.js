var commonModule = require('../common/common')
	,wishlistModule = require('./wishlists')
	,_ 	= require('underscore')
	,mongoose = require('mongoose')
	,async = require('async')
	,restler = require('restler')
	,UserModel = require('../models/usermodel').getUserModel()
	,MovieModel = require('../models/moviemodel').getMovie()
	,WishListModel = require('../models/wishlistmodel').getWishList();

// home page view render
exports.index = function(req,res){

	var userData = req.session.passport.user;
  	var userIds = [];
	UserModel.where('userId',userData.userId).findOne(function(error,userProfile){
		if(userProfile.following){
			userIds = userProfile.following;
		}
		// push ids of users which current user is following
		/*if(userProfile){
			_.each(userProfile.following,function(item){
				userIds.push(item + "");
			});	
		}
		*/
		userIds.push(userData.userId);
		// get movies created for all userIds
		commonModule.getMoviesByUserId(req,userIds,function(movies){
			res.render('index',{movies:movies,userData:userData});
		});
	});
}

//get list of movies from rotten tomatoes api
exports.getMovies = function(req,res){
	var sys 	= require('util'),
		apiKey = 'e842c601931f12aa1b36f8aef73ad211',
		query = req.query.q,
		options = {
			query:query,
			search_type: 'ngram'
		},
		imageBaseUrl = 'http://d3gtl9l2a4fn1j.cloudfront.net/t/p/',
		thumbSize = 'w92',
		bigSize = 'w342',
		normalSize = 'w185';

			console.log("here1");
			mdb = require('moviedb')(apiKey);
			console.log("here2");
		try{
			mdb.searchMovie(options,function(error,doc){
				if(error){ res.send("error");}
				var movies = [];
				var moviesArray = doc.results;
				for(var i=0; i< moviesArray.length; i++){
					movies.push({
						name: moviesArray[i].original_title,
						value: moviesArray[i].original_title,
						movieId: moviesArray[i].id, 
						imageUrl: moviesArray[i].poster_path?imageBaseUrl + normalSize + moviesArray[i].poster_path:null,
						thumbUrl: moviesArray[i].poster_path?imageBaseUrl + thumbSize + moviesArray[i].poster_path:null,
						imagePath: moviesArray[i].poster_path,
						yearOfRelease: moviesArray[i].release_date,
					});
				}
				res.send(movies);
			});
		}
		catch(error){
			console.log("Caught Error=>" + error);
			res.send("Error");
		}
}

exports.getMovieDetailById = function(req,res){
	//126250
	var options = {
		query:{
			api_key: 'e842c601931f12aa1b36f8aef73ad211',
			append_to_response:'keywords'
		}
	};
	var movieId = req.query.movieId;
	var url = 'http://api.themoviedb.org/3/movie/'+ movieId;
	console.log("movieId==>" + movieId);

	restler.get(url,options).once('complete', function(result) {
	  if (result instanceof Error) {
		console.log('Error: ' + result.message);
		res.send({status: "error"});
	  } 
	  else {
	  	var keywords = result.keywords.keywords,
	  		keywordsArray = [],
	  		genres=[],
	  		genresArray = result.genres;
	  	for(var i=0; i<keywords.length; i++){
	  		keywordsArray.push(keywords[i].name);
	  	}
	  	for(var j=0; j<genresArray.length; j++){
	  		genres.push(genresArray[j].name);
	  	}
	    res.send({
	    	imdb_id: result.imdb_id,
	    	overview: result.overview,
	    	popularity: result.popularity,
	    	keywords: keywordsArray,
	    	genres: genres.join(",")
	    });
	  }
	});
}

// save movie in database
exports.createMovie = function(req,res){

	var userData = req.session.passport.user
		,request = req.query
		,imageBaseUrl = 'http://d3gtl9l2a4fn1j.cloudfront.net/t/p/'
		,thumbSize = 'w92'
		,normalSize = 'w185'
		,largeSize = 'w342'
		,watchStatus = "";

	//imageBaseUrl + normalSize + moviesArray[i].poster_path
	if(request.watchStatus == "watched"){
		watchStatus = "Watched";
	}
	else if(request.watchStatus == "wanttowatch"){
		watchStatus = "Want to watch";
	}

	commonModule.getNextSequence('movieId',function(count){

		var tags = [];
		if(typeof request.associatedTags !== 'undefined' && request.associatedTags !== ''){
			var temp = request.associatedTags.split(",");
			for(var i=0; i<temp.length; i++){
				if(temp[i] !== ''){
					tags.push(temp[i].replace(/\s+/g, ''));
				}
			}
		}

		var movie = new MovieModel({
			name: request.moviename,
			movieId: count,
			tmdbId: request.movieid,
			coverPhoto: imageBaseUrl + normalSize + request.imageurl,
			coverPhotoLarge: imageBaseUrl + largeSize + request.imageurl,
			//date format yy-mm-dd
			yearOfRelease: request.yearofrelease,
			creationDate: new Date(),
			userDefinedSummary: request.userDefinedSummary,
			associatedTags: tags,
			creatorId: request.userId,
			creatorName: userData.userDisplayName,
			watchStatus: watchStatus,
			genres: request.genres.split(",")
		});

		movie.save(function(error,movie){
			if(error){
				res.send({status: "error"});
			}
			else {
					if(watchStatus){
						req.query.sysListType = request.watchStatus;
						req.query.movieId = movie.movieId;
						req.query.isNewMovie = "y";
						wishlistModule.addMovieToSystemList(req,res);
					}
					else{
						res.send({status: "success",movieId: count, msg: "Movie shared"});
					}
					console.log("updating movie count now for user id=>" + request.userId);
					MovieModel.count({creatorId:request.userId},function(error,count){
						UserModel.update(
							{userId:request.userId},
							{moviesCount:count},
							{multi:true},
							function(error, numberAffected, raw){
								if (error) {
									console.log("Error=>" + error)
								};
							}
						);
					}); // count ends
			} // else ends
		}); // save ends
	}); // get next sequence end
}

// movie page view

exports.showMovieById = function(req,res){

	var movieId = req.route.params.movieid;
	var userData = req.session.passport.user;
	var query = UserModel.find();
	MovieModel.where('movieId',movieId).findOne(function(error,movie){
		//console.log(movie);
		var favorited = "n";
		if(_.contains(movie.favorited,userData.userId)){
			favorited = "y";
		}
		res.render('showmovie',{movie:movie,userData:userData,favorited:favorited});
	});
}

exports.showUsersFavoritedMovie = function(req,res){
	var movieId = req.route.params.movieid;
	var userData = req.session.passport.user;
	var query = UserModel.find();
	MovieModel.where('movieId',movieId).findOne(function(error,movie){
		query
		.where('userId').in(movie.favorited)
		.sort({'userDisplayName':'asc'})
		.exec(function(error,favoritedUsersData){
			res.render('moviefavoritedusers',{movie:movie,userData:userData,favoritedUsers:favoritedUsersData});
		})
	});
}

exports.showMoviesByTag = function(req,res){
	//console.log("searchByHashTag");
	var tag = req.route.params.tag;
	var userData = req.session.passport.user;
	var query = MovieModel.find();
	var re = new RegExp(tag,"i");

	query.where('associatedTags').regex(re).exec(function(error,movies){
		if(error) { 
			res.send("Error"); 
		}
		res.render('moviesbytag',{movies:movies,userData:userData,tag:tag});
	});
}

// mark a movie favorite for the user
exports.favoriteMovie = function(req,res){

	var userData = req.session.passport.user;

	var conditions = { movieId: req.query.movieId }
	  	, update = { $push : { favorited : userData.userId }}
	  	, options = { multi: true };

	MovieModel.update(conditions, update, options, function(){
		console.log("movie updated successfully");
		UserModel.update(
			{ userId: userData.userId },
			{ $push : { favoritedMovies : req.query.movieId }},
			{ multi: true },
			function(){
				console.log("user profile updated for this movie");
				res.send({message: "sent"});
			}
		);
	});
}

// unfavorite a favorite movie for the user
exports.unfavoriteMovie = function(req,res){

	var userData = req.session.passport.user;

	var conditions = { movieId: req.query.movieId }
	  	, update = { $pull : { favorited : userData.userId }}
	  	, options = { multi: true };

	MovieModel.update(conditions, update, options, function(){
		console.log("movie updated successfully");
		UserModel.update(
			{ userId: userData.userId },
			{ $pull : { favoritedMovies : req.query.movieId }},
			{ multi: true },
			function(){
				console.log("user profile updated for this movie");
				res.send({message: "sent"});
			}
		);
	});
}

exports.addComment = function(req,res){

	var userData = req.session.passport.user;

	var comment = {
		commentorName: userData.userDisplayName,
		commentorId: userData.userId,
		comment: req.body.comment
	}

	var conditions = { movieId: req.body.movieid }
		  	, update = { $push : { comments : comment }};

	MovieModel.update(conditions, update, function(error, doc){
		if(error){
			console.log("Error=>" + error);
			res.send({status: "Error"});
		}
		else{
			console.log("Comment Added");
			res.send({status: "success"});
		}
	});
}
