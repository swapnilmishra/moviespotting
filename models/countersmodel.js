var mongoose = require('mongoose');

var countersSchema = mongoose.Schema({
	_id: String,
	seq: Number
})
var Counters = mongoose.model('Counters',countersSchema);

exports.getCounter = function(){
	return Counters;
}