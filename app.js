
/**
 * Module dependencies.
 */

var express = require('express')
  , flash = require('connect-flash')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , mongoose = require('mongoose')
  , format = require('util').format
  , passport = require('passport')
  , movies = require('./routes/movies')
  , user = require('./routes/user')
  , search = require('./routes/search')
  , wishlists = require('./routes/wishlists')
  , explore = require('./routes/explore')
  , common = require('./common/common')
  , FacebookStrategy = require('passport-facebook').Strategy
  , LocalStrategy = require('passport-local').Strategy
  , profileImgRootDir = './public/'
  , profileImgSubDir = 'profilepics/';

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.compress());
  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  //app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser({uploadDir:'./'}));
  app.use(express.session({ secret: 'moviespotting' }));
  app.use(express.methodOverride());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// initialize db connection once and use it everywhere
  mongoose.connect('mongodb://localhost/moviedb');
  var db = mongoose.connection;
  db.on('error', function(err){
    if(err){
      db.db.close();
      connect();
    }
  });

  function connect(){
    db.open('localhost', 'moviedb'); 
  }

process.on('uncaughtException',function(e){
  console.log("Error=>" + e);
});
// index page handler to render main page. Check first for user authentication
app.get('/',ensureAuthenticated,movies.index);
// ajax request to create movie
app.get('/movie/create',ensureAuthenticated,movies.createMovie);
// ajax request to get movies list from rotten tomatoes api
app.get('/movie/getmovies',ensureAuthenticated,movies.getMovies);
// ajax request to get seleteed movie details
app.get('/movie/getmoviedetails',movies.getMovieDetailById);
// showing movie page
app.get('/movie/showmovie/:movieid',ensureAuthenticated, movies.showMovieById);
// showing movie page
app.get('/movie/showusersfavoritedmovie/:movieid',ensureAuthenticated, movies.showUsersFavoritedMovie);
//show movie based on tags
app.get('/movie/tags/:tag',ensureAuthenticated, movies.showMoviesByTag);
// favorite api
app.get('/movie/favorite',movies.favoriteMovie);
// unfavorite api
app.get('/movie/unfavorite', ensureAuthenticated, movies.unfavoriteMovie);
// add comment for a movie
app.post('/movie/addcomment', ensureAuthenticated, movies.addComment);
// create wishlist api
app.get('/list/createwishlist', ensureAuthenticated, wishlists.createWishList);
// create wishlist and add movie api
app.get('/list/createwishlistaddmovie', ensureAuthenticated, wishlists.createWishListWithMovie);
// get wishlists for a given movie
app.get('/list/getwishlists', ensureAuthenticated, wishlists.getWishLists);
// add movie to wishlist api
app.get('/list/addmovie', ensureAuthenticated, wishlists.addMovieToWishList);
// add movie to wishlist api
app.get('/list/removemovie', ensureAuthenticated, wishlists.removeMovieFromWishList);
// show wishlists page view
app.get('/list/showwishlists/:userid', ensureAuthenticated, wishlists.showWishLists);
// show wishlist page by id
app.get('/list/showwishlist/:listid', ensureAuthenticated, wishlists.showWishList);
// add movie to 'want to watch' or 'watched' list
app.get('/list/addtosyslist', ensureAuthenticated, wishlists.addMovieToSystemList);
// movie search by tag
app.get('/search/movie/tag/:query', ensureAuthenticated, search.searchMoviesByTag);
app.get('/search/movie/tag/', ensureAuthenticated, search.searchMoviesByTag);
// movie search by name
app.get('/search/movie/name/:query', ensureAuthenticated, search.searchMoviesByName);
app.get('/search/movie/name/', ensureAuthenticated, search.searchMoviesByName);
// wishlist search
app.get('/search/wishlist/name/:query', ensureAuthenticated, search.searchWishlists);
// movie search by username
app.get('/search/user/:query', ensureAuthenticated, search.searchUsersByName);
app.get('/search/user/', ensureAuthenticated, search.searchUsersByName);
// view for search page which is posted from search bar
app.post('/search/', ensureAuthenticated, search.showMoviesByName);
//view for current user profile
app.get('/user/showuserprofile',ensureAuthenticated, user.showUserProfile);
//view for any user profile
app.get('/user/showuserprofile/:userid',ensureAuthenticated, user.showAnyUserProfile);
// showing favorited movies by user
app.get('/user/showfavoritemovies/:userid',ensureAuthenticated, user.showFavoriteMovies);
// showing followers for user
app.get('/user/showfollowers/:userid',ensureAuthenticated, user.showUserFollowers);
// showing followers for user
app.get('/user/showfollowings/:userid',ensureAuthenticated, user.showUserFollowings);
//follow user api
app.get('/user/followuser',ensureAuthenticated, user.followUser);
//unfollow user api
app.get('/user/unfollowuser',ensureAuthenticated, user.unfollowUser);
// show activity stream
app.get('/user/showactivitystream', ensureAuthenticated, user.showActivityStream);
// check new activities for a user
app.get('/user/checknewactivity', ensureAuthenticated, user.checkNewActivity);
// clear new activities for a user
app.get('/user/clearnewactivity', ensureAuthenticated, user.clearNewActivities);
// show  users sorted by popularity(number of followers)
app.get('/explore/popularusers', ensureAuthenticated, explore.showPopularUsers);
// show popular movies
app.get('/explore/popularmovies', ensureAuthenticated, explore.showPopularMovies);
// show recent movies
app.get('/explore/recentmovies', ensureAuthenticated, explore.showRecentMovies);
// send user feedback
app.post('/feedback',common.sendFeedback);
// user sign up
app.post('/usersignup',common.userSignup);

app.post('/user/profilepic/upload', ensureAuthenticated, function(req,res){
  // the uploaded file can be found as `req.files.image` and the
  // title field as 'req.body.title'
  // get the temporary location of the file
  var userData = req.session.passport.user;
  var tmp_path = req.files.image.path;
  var fileName = req.files.image.name;
  console.log(format('Uploading %s to %s ', fileName, tmp_path));
  var fileExtension  = fileName.slice(fileName.lastIndexOf('.'),fileName.length);
  // set where the file should actually exists - in this case it is in the public/<userid>/ directory
  var target_path = profileImgRootDir + profileImgSubDir + userData.userId + '/' + userData.userId + fileExtension;
  var target_subpath = profileImgSubDir + userData.userId + '/' + userData.userId + fileExtension;
  console.log('target_path==>' + target_path);
  // path for the user directory based on id
  var newDir = profileImgRootDir + profileImgSubDir + userData.userId + '/';
  // check is directory exists if not create it syncronously
  fs.exists(newDir,function(exists){
    if(!exists){
      console.log('directory doesnt exitst creating it now');
      fs.mkdirSync(newDir);
    }
    renameUpFile();
  });

  // move the file from the temporary location to the intended location
  var renameUpFile = function(){

    fs.rename(tmp_path, target_path, function(err) {
      if (err) throw err;
      // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
      fs.unlink(tmp_path, function() {
        if (err) {throw err;}
        else{

          var usermodel = require('./models/usermodel');
          var UserModel = usermodel.getUserModel();

            UserModel.update(
              { userId:userData.userId },
              { $set: {userDp:'/' + target_subpath} },
              function(err,numRecords,raw){
                if(err) {
                  console.log(err);
                }
                else {
                  console.log('Updated new profie image for user');
                  res.redirect('/user/showuserprofile');
                }
            });
        }
      });
    });
  };

});

app.get('/user/removeprofilepic',ensureAuthenticated,user.removeProfilePic);
// fb-login, fb-logout urls
app.get('/login',function(req,res){
  var message = req.flash('error').toString();
  res.render('login',{message : message});
});

app.get('/signup',function(req,res){
  var message = req.flash('error').toString();
  res.render('signup');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

// passport facebook strategy

passport.use(new FacebookStrategy({
    clientID: 349851071794551,
    clientSecret: '5b13bc55f74cb1dba2ebee7129bab3fc',
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'username' ,'photos', 'emails']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("FB Auth done");
    var usermodel = require('./models/usermodel');
    var UserModel = usermodel.getUserModel();
    console.log(profile);

    UserModel.where('userEmailId',profile.emails[0].value).findOne(function(error,userProfile){
      if(userProfile){
        if(userProfile.userDp == undefined || userProfile.userDp == ""){
          userProfile.userDp = profile.photos[0].value;
          userProfile.save(function(){
            done(null,userProfile);
          });
        }
        else{
          done(null,userProfile);
        }
        console.log("user info found");
      }
      else{
       common.getNextSequence("userId",function(count){
          console.log("user info not found setting it up");
          var userInfo = {
            userId: count+'',
            userName: profile.username,
            userDisplayName: profile.displayName,      
            userEmailId: profile.emails[0].value,
            userDp: profile.photos ? profile.photos[0].value : "",
            following: [],
            followers: [],
            favoritedMovies:[],
            moviesCount:0,
            wishListCount: 0
          }

          console.log("userinfo from FB==>" + JSON.stringify(userInfo));

          userModel = new UserModel(userInfo);

          userModel.save(function(error){
            if(error){
              console.log("Error=>" + error);
            }
            else {
              if(process.env != 'development'){
                common.sendMail(userInfo);
              }
              done(null,userInfo);
            }
          }); // end save
        }); // end count
      } //end else
    });
  }));

// passport local strategy

passport.use(new LocalStrategy(
  function(username, password, done) {

    console.log("Useremail=>" + username);
    // fetch user info from db

    var usermodel = require('./models/usermodel');
    var UserModel = usermodel.getUserModel();

    var query = UserModel.find();
    query.and([{userEmailId: username},{password: password}]).findOne(function(error,doc){
      if (doc) {
        return done(null, doc);
      } 
      else{
        return done(null, false, { message: "Please check if username of password is correct" });
      }

    });
  }
));


// authentication middleware
// should be called before any direct url access
function ensureAuthenticated(req, res, next) {
  req.session.redirect_url = req.route.path;
  if (req.isAuthenticated()) {
    console.log("authorized");
    next();
  }
  else {
    console.log("not authorized");
    res.redirect('/login');
  }
}

//storing and retrieving data from cookies/session

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// passport-local authentication

app.post('/userlogin',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

// passport-facebook authentication

app.get('/auth/facebook', passport.authenticate('facebook',{scope:['email']}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect:'/',
                                            failureRedirect: '/login'}));


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
