const host = 'http://db:5984'
const db = host + '/event'
const request = require('request')

var index = function(req,res){
    var query = {
		'selector': {
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
                console.log("[index.js] - going to print response from db...")
                if(obj != undefined && obj.docs != undefined){
                    console.log(obj.docs)
                    console.log('[index.js] - GET ok from event/_all_docs')
                    res.render('pages/index', {events: obj.docs})
                }else{
                    console.log('[index.js] - ERROR GET ok from event/_all_docs')
                    res.render('pages/index',{ results: 'fail'})
                }
        } else {
                console.log(error)
                res.render('pages/index')
        }
    })
}

module.exports.send_page = index