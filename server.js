const express = require('express')
const port = process.env.PORT || 3030
const passport = require('passport')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
const NodeCouchDb = require('node-couchdb')
const couch = new NodeCouchDb({
    host: 'db',
    protocol: 'http',
    port: 5984
})
const request = require('request')
// node module amqp (we use topics based queue)
const amqp = require('amqplib/callback_api')

var app = express()
/*
var server = require('http').Server(app)
var io = require('socket.io')(server)
var chat = io.of('/chat')
server.listen(port)
*/
// set the view engine to ejs
app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'sundayHoliday', resave: false, saveUninitialized: false }))

app.use(passport.initialize())
app.use(passport.session()) // persistent login sessions
app.use(flash())

require('./code/init_db.js')(couch)

//require('./code/amqp.js')(app,chat)
app.listen(port)
console.log('3000 is the magic port')

require('./code/routes.js')(app, passport,amqp)
require('./code/passport.js')(passport)
require('./code/api.js')(app,request, couch)

setTimeout(function() {
    require('./code/amqp_client')(couch)
},3000)
