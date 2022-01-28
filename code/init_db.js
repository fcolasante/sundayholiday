const request = require('request')
const host = 'http://db:5984'

// get a random uuid from database
function getNewId (done) {
  request({
    url: host + '/_uuids',
    method: 'GET'
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      done(true, JSON.parse(body).uuids[0])
    } else {
      console.log('[user.js] ' + error)
      done(false, null)
    }
  })
}

function searchEvent(title, done) {
    var query = {
	'selector': {	
	    'title': {'$eq': title }
	}
    }
    request({
	url: host + '/event/_find',
	method: 'POST',
	headers: {
	    'Content-Type': 'application/json'
	},
	body: JSON.stringify(query)
    }, function (error, response, body) {
	if (!error) {
	    var event = JSON.parse(body)
	    if (typeof event.docs[0] !== 'undefined') {
		console.log("[init_db.js] - This event already exists" + event)
		return done(false)
	    } else {
		console.log("[init_db.js] event doesn't exists")
		return done(true)
	    }
	} else {
	    console.log('[init_db.js] ' + error)
	    return done(false)
	}
    })
}

// Formato eventi sul db, compatibile con calendar
// ------------------ eventi prova ---------------
var eventoFalzo1 = {
    'end': {
	'date': '2019-09-08'
    },
    'start': {
	'date': '2019-09-08'
    },
    'title': 'Trofeo Scarfiotti',
    'description': 'Cronoscalata Sarnano-Sassottetto',
    'location': 'Sarnano',
    'lat': '654646455',
    'lng': '239857928',
    'fblink': 'facebookLink'
}

var eventoFalzo2 = {
    'end': {
	'date': '2019-02-28'
    },
    'start': {
	'date': '2019-02-28'
    },
    'title': 'Gita a Campotoso',
    'description': 'Escursione al Lago',
    'location': 'Hollywood',
    'lat': '654646455',
    'lng': '239857928',
    'fblink': 'facebookLink'
}

var eventoFalzo3 = {
    'end': {
	'date': '2019-02-08'
    },
    'start': {
	'date': '2019-02-08'
    },
    'title': 'Mammozzone di divertimento',
    'description': 'entropia',
    'location': 'battuta sul suo sito ordine',
    'lat': '641684348',
    'lng': '654646455',
    'fblink': 'facebookLink'
}
//-------------------------------------------------


// inizializza il database dbName in couchdb
function putDb (dbName) {
  request({
    url: host + '/' + dbName,
    method: 'PUT'
  }, function (error, response, body) {
    if (error) {
      console.log('[init_db.js] - Error put DB')
      console.log(error)
    }
  })
}


function putData (dbName, obj) {
    getNewId(function (result, id) {
	if (result === false) {
	    console.log('[init_db.js] failed to get an id')
	    return
	}
	searchEvent(obj.title, function(notFound) {
	    if (notFound === false) return
	    request({
		url: host + '/' + dbName + '/' + id,
		method: 'PUT',
		headers: {
		    'Content-Type': 'application/json'
		},
		body: JSON.stringify(obj)
	    }, function (error, response, body) {
		if (error) {
		    console.log('[init_db.js] - Error put Data into ' + dbName)		
		} else {
		    console.log('[init_db.js] - Data added correctly to ' + dbName)
		    console.log(error)
		}
	    })
	})
    }, function (error, response, body) {
        if (!error) {
	    console.log('[init_db.js] created the user')
	} else {
            console.log('[init_db.js] ' + error)
        }
    })
}
function putFixedData(couch, dbName, obj, id){
    couch.insert(dbName, {
        _id: id,
        field: obj
    }).then(({data, headers, status}) => {
        // data is json response
        // headers is an object with all response headers
        // status is statusCode number
    }, err => {
        // either request error occured
        // ...or err.code=EDOCCONFLICT if document with the same id already exists
    });
}

module.exports = function (couch) {
  setTimeout(function () {
    putDb('_users')
    putDb('users')
    putDb('event')  
    putData('event', eventoFalzo1)
    putData('event', eventoFalzo2)
    putData('event', eventoFalzo3)
    putFixedData(couch, 'event',eventoFalzo1,1)
  }, 1500) // lezzata per creare i db dopo aver avviato couchdb
}
module.exports.putData = putData    
