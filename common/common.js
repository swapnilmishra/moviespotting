var mongoose = require('mongoose');
var UserModel = require('../models/usermodel').getUserModel();
var MovieModel = require('../models/moviemodel').getMovie();
var CounterModel = require('../models/countersmodel').getCounter();
var path           = require('path')
  , templatesDir   = path.resolve(__dirname,'../public','email-templates')
  , emailTemplates = require('email-templates')
  , mandrill = require('mandrill-api/mandrill')
  , mandrill_client = new mandrill.Mandrill('mLbH2q6oVKKKYU9Bq8_0NA');

  //, nodemailer     = require('nodemailer');
var host = "localhost";

// send mail to user after sign up Yayy !!
exports.sendMail = function(userData){

	console.log("Sending mail to " + userData.userDisplayName);

	emailTemplates(templatesDir, function(err, template) {
	  if (err) {
	    console.log(err);
	  } else {
	    // An example users object with formatted email function
	    var locals = {
	      email: userData.userEmailId,
	      name: userData.userDisplayName
	    };
	    // Send a single email
	    template('welcome', locals, function(err, html, text) {
	      if (err) {
	        console.log(err);
	      } 
	      else {
      		var message = {
			    "html": html,
			    "text": text,
			    "subject": 'Welcome to MovieSpotting!!',
			    "from_email": "moviespottingservice@gmail.com",
			    "from_name": "MovieSpotting",
			    "to": [{
			            "email": locals.email,
			            "name": locals.name
			        }],
			    "headers": {
			        "Reply-To": "moviespottingservice@gmail.com"
			    },
			    "important": true,
			    "bcc_address": "moviespottingservice@gmail.com"
			};
			var async = false;
			mandrill_client.messages.send({"message": message, "async": async,}, function(result) {
			    console.log(result);
			}, function(e) {
			    // Mandrill returns the error as an object with name and message keys
			    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
			    // A mandrill error occurred: PaymentRequired - This feature is only available for accounts with a positive balance.
			});
	      }
	    });
	  }
	});

}
// save userid and name if its a new user
exports.setUserInfo = function(userData){

	UserModel.where('userEmailId',userData.userEmailId).findOne(function(error,doc){
			if(doc){
				console.log("user info found");
			}
			else{
				UserModel.count({},function(error,count){
  				console.log("user info not found setting it up");
  				//console.log("userinfo from FB==>" + JSON.stringify(userData));
  				var userInfo = {
  					userId: count+1,
  					userName: userData.userName,
  					userDisplayName: userData.userDisplayName,
  					userEmailId: userData.userEmailId
  				}
  				userModel = new UserModel(userInfo);
  				userModel.save(function(error){
					if(error){
						console.log("Error=>" + error);
					}
					else {
						console.log("saved user info");
					}
				});	
			});
  		}
		});
}


exports.userSignup = function(req,res){

	var userData = {
		userEmailId : req.body.useremail,
		userDisplayName : req.body.userdisplayname,
		password: req.body.password,
		following: [],
		followers: [],
		favoritedMovies:[],
		moviesCount: 0,
		wishListCount: 0
	}

	UserModel.where('userEmailId',req.body.useremail).findOne(function(error,doc){
		if(doc){
			console.log("user info found");
			res.send({"message": "looks like this user already exist in system"});
		}
		else{
			console.log("user info not found setting it up");
			// get total number of user to assign ids in case of new user
			exports.getNextSequence("userId",function(count){
				console.log("There are %d users in system",count);
				userData.userId = count+'';
				var userName = userData.userEmailId.substring(0,userData.userEmailId.indexOf("@"));
				userData.userName = userName;

  				userModel = new UserModel(userData);
  				userModel.save(function(error){
					if(error){
						console.log("Error=>" + error);
						res.send({"error": error});
					}
					else {
						res.send({"message": "Your account created successfully, Please <a href='/login'>log in</a>"});
						exports.sendMail(userData);
					}
				});
			});
		}
	});
}

exports.getMoviesByUserId = function(req,userIds,callback){
	var userData = req.session.passport.user;
	var query = MovieModel.find();
	//for a single user
	if(typeof userIds === "string"){
		query
		.where('creatorId',userIds)
		.sort({creationDate: 'desc'})
		.exec(function(err,movies){
			callback(movies);
		});
	}
	// user ids as arrays
	else{
		query
		.where('creatorId').in(userIds)
		.sort({creationDate: 'desc'})
		.exec(function(err,movies){
			if(err){
				console.log("Error: " + err);
			}
			callback(movies);
		});
	}
}

exports.getNextSequence = function(seqparam,callback){

	console.log("getting next seq for " + seqparam);

	var conditions = {_id:seqparam};
	var update = {$inc: {seq:1}};
	var options = {new:true};

	CounterModel.findOneAndUpdate(conditions,update,options,function(err,doc){
		callback(doc.seq);
	});
}

exports.sendFeedback = function(req,res){

	var mailContent = "<h4> Username: "  + req.body.username + "</h4>";
	mailContent += "<h4> EmailId: "  + req.body.useremail + "</h4>";
	mailContent += "<h4> Subject: "  + req.body.subject + "</h4>";
	mailContent += "<h4> Summary: </h4>";
	mailContent += "<h4 style='color:#aaa'>" + req.body.detail + "</h4>";
	console.log(mailContent);
	var message = {
	    "html": mailContent,
	    "subject": "Feedback",
	    "from_email": "moviespottingservice@gmail.com",
	    "from_name": "MovieSpotting-Feedback",
	    "to": [{
	        "email": "moviespottingservice@gmail.com",
	        "name": "MovieSpotting"
	    }],
	    "important": false
	};
	var async = false;
	mandrill_client.messages.send({"message": message, "async": async,}, function(result) {
	    console.log(result);
	    res.send("done");
	}, function(e) {
	    // Mandrill returns the error as an object with name and message keys
	    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	    // A mandrill error occurred: PaymentRequired - This feature is only available for accounts with a positive balance.
	});
}