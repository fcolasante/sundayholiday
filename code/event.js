const db = 'http://db:5984/event'

var Wth = {
    'weather':['Non disponibile']
}

var get_local_event = function(req, res, request){
    console.log("[event] - going to print req.query ...")
    console.log(req.query.event)

    request({
	url: db + '/' + req.query.event,
	method: 'GET',
    }, function (error, response, body) {
	if (!error) {
	    console.log(body)
	    var result = JSON.parse(body)
	    res.render("pages/event", {resultInfo: result, weather: Wth})
	}else{
	    console.log(error)
	}
    })
}

var send_comment= function(req,res,amqp) {
    amqp.connect('amqp://amqp', function(err, conn) {
	conn.createChannel(function(err, ch) {
	    var ex = 'topic_logs';
	    var msg = req.body.comment;
	    var username;
	    if(req.isAuthenticated()){
		if(req.user.local){
		    username = req.user.local.username;
		}
		else {
		    username = req.user.google.name;
		}
	    }else{
		username = "guest"
	    }
	    console.log(req.body)
	    var numero = req.body.event
	    var location = req.body.location
	    var severity = location.toString() +"." + numero.toString()+"."+username;
	    
	    ch.assertExchange(ex, 'topic', {durable: false});
	    ch.publish(ex, severity, new Buffer(msg));
	    console.log("[event.js] Sent "+msg+" on queue with topic: "+severity);
	    setTimeout(
		function(){
		    res.redirect("/event?event=" + numero)
		},1000
	    )
	    
	});
    });
}


module.exports.send_page = get_local_event

module.exports.send_comment = send_comment
