const db = require('./init_db.js')
const Calendar = require('./calendar.js')

var save = function(req, res){
	console.log("[save&display.js] - going to print req.body ...")
	console.log(req.body)
	console.log("[save&display.js] - going to put data in CouchDB ...")
	var event = {
    	    'end': {
		'date': req.body.date
    	    },
    	    'start': {
		'date': req.body.date
    	    },
	    'title': req.body.title,
    	    'description': req.body.description,
    	    'location': req.body.location,
	    'lat': req.body.lat,
    	    'lng': req.body.lng,
	    'fblink': req.body.fblink
	}
	db.putData("/event", event)
	if(req.isAuthenticated()){
		if(req.user.google){
			Calendar.addEvent(event, req.user)
		}
	}
	res.redirect('/');
}

module.exports.send_page = save
