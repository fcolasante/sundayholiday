var amqp = require('amqplib/callback_api')

module.exports = function (cb) {
  setTimeout(function(){
  amqp.connect('amqp://amqp', // non va inserito localhost poiché gira su Docker
    function (err, conn, self) {
      if (err) {
        console.log(err)
        throw new Error(err)
      }
      cb(conn)
    })
  }
  ,1000)

}
