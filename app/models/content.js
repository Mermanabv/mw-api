var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

/*
    {"content" :
         {
            "contentId" : 1450855151000,
	    "title" : "My second event",
            "startDateTime" : 1450855151000,
	    "endDateTime" : 1450858751000,
            "catchupTv" : true,
	    "parentalLevel" : "TV7",
            "hd" : true,
	    "genre" : "Action",
         }
	}
*/

var ContentSchema   = new Schema({
        "contentId" : Number,
	    "title" : String,
        "startDateTime" : Number,
	    "endDateTime" : Number,
        "catchupTv" : Boolean,
	    "parentalLevel" : String,
        "hd" : Boolean,
	    "genre" : String
});

module.exports = mongoose.model('Contents', ContentSchema);