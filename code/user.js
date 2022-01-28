const request = require('request')
const nodemailer = require('nodemailer') // used to send mails
const bcrypt = require('bcrypt-nodejs') // module which handles the encryption of the password
const SECRETS = require('../secrets/secret')
const host = 'http://db:5984'
const db = host + '/users'

// search for a user given the username
var search = function (username, done) {
  // the selector object adds to the resulting query all the documents maching its elements
  var query = { 'selector': {
    // this object matches when AT LEAST one of its elements matches
    '$or': [
      { 'local.username': username },
      { 'google.name': username }
    ]
  } }
  // sending the query to the DB
  request({
    url: db + '/_find',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query)
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var usr = JSON.parse(body)
      // if the result isn't empty return it
      if (typeof usr.docs[0] !== 'undefined') {
        return done(true, usr.docs[0])
      } else {
        // the rersult is empty so the aren't user with the specified username
        console.log("[user.js] user doesn't exists")
        return done(false, null)
      }
    } else {
      console.log('[user.js] ' + error)
      return done(false, null)
    }
  })
}

// get a user by the documents id (used to deserialize the user from the session becase it's faster than a query)
var get = function (id, done) {
  request({
    url: db + '/' + id,
    method: 'GET'
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      done(true, JSON.parse(body))
    } else {
      done(false, null)
    }
  })
}

// create a new user on the databes given its model
var create = function (usr, done) {
  // get and id for the document
  getNewId(function (result, id) {
    if (result === false) {
      console.log('[user.js] failed to get an id')
      return done(false)
    }
    // make a request to the database to save the user
    request({
      url: db + '/' + id,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usr)
      // callback to check if the user already exists or there were problems
    }, function (error, response, body) {
      if (!error && (response.statusCode === 202 || response.statusCode === 201)) {
        request({
          url: db + '/' + id,
          method: 'GET'
        }, function (error, response, body) {
          if (!error && response.statusCode === 200 && (usr.local !== undefined || usr.google !== undefined)) {
            console.log('[user.js] created the user')
            if (usr.local !== undefined) {
              sendMail(usr.local.username, usr.local.email, id)
            }
            done(true, JSON.parse(body))
          } else {
            console.log('[user.js] ' + error)
            done(false, null)
          }
        })
      } else {
        if (!error && response.statusCode === 409) {
          console.log('[user.js] existing user')
          return done(false, null)
        } else {
          return done(false, null)
        }
      }
    })
  })
}
// check if the password matches the saved hash
var check = function (user, password, done) {
  return done(bcrypt.compareSync(password, user.local.password))
}

// create the hash of a password to store it in the database
var createhash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

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
function sendMail (username, email, id) {
  var mailOptions = {
    from: '<sundayHoliday18@gmail.com>', // sender address
    to: email,
    subject: 'Thanks for registering with SundayHoliday',
    html: '<p> Hi ' + username + ' Click <a href="http://localhost:8080/registration?registration=' + id + '">here</a> to confirm your registration.</p>'
  }
  // which service are we going to use?
  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: SECRETS.GMAIL_EMAIL,
      pass: SECRETS.GMAIL_PASSWORD
    }
  })
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('[user.js] ' + error)
    }else{
      console.log(info)
      console.log('Email verification sent')
    }
  })
}
// making functions visible to other modules
module.exports.check = check
module.exports.search = search
module.exports.create = create
module.exports.createhash = createhash
module.exports.get = get
