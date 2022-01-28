var SECRETS = require('../secrets/secret')
const request = require('request')
const host = 'http://db:5984'
const db = host + '/event'
const ow = require('./openWeather.js')
var send_page = function (req, res,weather) {
    console.log("[get_saved_event.js] - going to print req.query...")
    console.log(req.query)

	
    var query = {
		'selector': {
			'$or': [
	    		{'location': {'$eq': req.query.name }},
	    		{'title': {'$eq': req.query.name }}]
			}
    	}   
    request({
	url: db + '/_find',
	method: 'POST',
	headers: {
	    'Content-Type': 'application/json'
	},
	body: JSON.stringify(query)
    }, function (error, response, body) {
	if (!error) {
            var obj = JSON.parse(body)
            console.log("[get_saved_event.js] - going to print response from db...")
            if(obj != undefined && obj.docs[0] != undefined){
            console.log(obj.docs[0])
            if(obj != undefined){
		        console.log('[get_saved_event.js] - GET ok from event/_all_docs')
		        console.log('obj.docs[0]: ' +body )
		        ow.get_weather(obj.docs[0], res, function(weatherz){
					res.render("pages/event", {resultInfo: obj.docs[0], weather: weatherz})	
				})

            }else{
		        console.log('[get_saved_event.js] - ERROR GET ok from event/_all_docs')
		        //console.log(obj.total_rows)
				res.render('pages/index',{ results: 'fail'})
            }
	} else {
            console.log(error)
            res.redirect('/')
	}
    }})
}
        
module.exports.send_page = send_page
