// module to use couchdb database
module.exports = function(couch){

    //node module amqp (we use topics based queue)
    var amqp = require('amqplib/callback_api');

    var startup_flag=true;

    // array that stores comments
    var comms = [];
    var keys=["*.*.*"];

    function updateComment(db,data,comment) {
        couch.update(db,data).then(({data, headers, status}) => {
            console.log(data)
        }, err => {
            console.log(err);
        }).catch()
    }

    amqp.connect('amqp://amqp', function(err, conn) {
        conn.createChannel(function(err, ch) {
            var ex = 'topic_logs';

            ch.assertExchange(ex, 'topic', {durable: false});

            ch.assertQueue('', {exclusive: true}, function(err, q) {
                console.log('[amqp_client.js] Waiting for comments');

                keys.forEach(function(severity) {
                    ch.bindQueue(q.queue, ex, severity);
                });

                ch.consume(q.queue, function(msg) {
                    var today=new Date();
                    var m=today.getMonth()+1;
                    console.log("[amqp_client.js] received ["+msg.fields.routingKey+"]: "+msg.content.toString());
                    var key=msg.fields.routingKey.split(".");
                    var db= 'event';
                    var cr_num=key[1];
                    var user=key[2];
                    var id= key[1]
                    couch.get(db,id).then(({data, headers, status}) => {
                        var comment={
                                    "date": today.getDay()+"/"+m+"/"+today.getFullYear(),
                                    "hour": today.getHours()+":"+today.getMinutes()+";",
                                    "user": user,
                                    "comment": msg.content.toString()
                                    }
                        if(data.comments == undefined){
                            data.comments = [comment]
                        }else{
                            data.comments.push(comment)
                        }
                        console.log(data.comments)
                        updateComment(db,data,null)
                    }, err => {
                        console.log("[amqp_client.js] "+err);
                    });
                }, {noAck: true});
            });
        });
    });
}
