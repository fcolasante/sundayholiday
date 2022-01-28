const request = require('request')
var API_CALENDAR_EVENTS = 'https://www.googleapis.com/calendar/v3/calendars/'
var calendarId = 'primary';
const host = 'http://db:5984'
const usersDb = host + '/users'
const Routes = require('./routes.js')

var insert = function (event, user) {
    var query = {
	'end': {
	    'date': event.end.date
	},
	'start': {
	    'date': event.start.date
	},
	'description': event.description,
	'location': event.location,
	'summary': event.title
    }
    
    request({
	url: API_CALENDAR_EVENTS + calendarId
		+'/events'
		+'?sendUpdates=all'
		+'&access_token=' + user.google.token,
	method: 'POST',
	headers: {
	    'Content-Type': 'application/json'
	},
	body: JSON.stringify(query)
    }, function (error, response, body) {
	if (!error) {
		console.log("[calendar.js] --" + user.google.token)
	    console.log('[test_calendar.js] - Event added to your calendar\n' + body)
	} else {
	    console.log('[test_calendar.js] ' + error)
	}
    }, function (error, response, body) {
    if (!error) {
	console.log('[user.js] created the user')
    } else {
	console.log('[user.js] ' + error)
    }
    })
}

module.exports.addEvent = insert
