var mongoose = require('mongoose');

var movieSchema = mongoose.Schema({
			name: String,
			movieId: String,
			creatorId: String,
			creatorName: String,
			tmdbId: String,
			coverPhoto: String,
			coverPhotoLarge: String,
			yearOfRelease: String,
			creationDate: Date,
			likes: Array,
			favorited: Array,
			suggestedTo: Array,
			userDefinedSummary: String,
			associatedTags: Array,
			genres: Array,
			watchStatus: String,
			comments: [{
				commentorName: String,
				commentorId: String,
				comment: String
			}]
});

var Movie = mongoose.model('Movie',movieSchema);

exports.getMovie = function(){
	return Movie;
}