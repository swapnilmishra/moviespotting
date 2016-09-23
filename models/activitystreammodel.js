var mongoose = require('mongoose');

var activityStreamSchema = mongoose.Schema({
		actId: String,
		actor: {
			id: String,
			name: String
		},
		date: Date, 	
		verb: String,
		targetObj: {
			objType: String,
			id: String,
			name: String
		},
		metaObj: {
			id: String,
			name: String
		},
		userRead: Array
});
var ActivityStream = mongoose.model('ActivityStream',activityStreamSchema);

exports.getActivityStream = function(){
	return ActivityStream;
}

// 1(actor/userid) followed(verb) you(target/{id:userid,type:user})
// you(actor/userid) created(verb) 5(target/{id:listid,type:list})
// you(actor/userid) created(verb) 5(target/{id:movieid,type:movie})
// you(actor/userid) added(verb) 5(target/{id:movieid,type:movie}) to 10(object/{id:listid,name:listname})