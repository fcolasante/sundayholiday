// modulo esempio per autenticazione google OAUTH con passport
/* ---------------------------------------------------------------
The Client Id and Client Secret needed to authenticate with Google can be set up from the
Google Developers Console. You may also need to enable Google+ API in the developer console,
otherwise user profile data may not be fetched. Google supports authentication with
both oAuth 1.0 and oAuth 2.0. */

// npm install passport-google-oauth
const SECRETS = require('../secrets/secret')
const User = require('./user')
const GoogleStrategy = require('passport-google-oauth2').Strategy
const LocalStrategy = require('passport-local').Strategy

module.exports = function (passport) {
  // serialize an user to authenticate its sessions
  passport.serializeUser(function (user, done) {
    done(null, user._id)
  })

  // from the username get all the user info
  passport.deserializeUser(function (id, done) {
    User.get(id, function (found, user) {
      if (found) {
        done(null, user)
      } else {
        done(null, false)
        console.log('[passport.js] failed to deserialize user ' + id)
      }
    })
  })

  passport.use(new GoogleStrategy({
    clientID: SECRETS.GOOGLE_ID_CLIENT,
    clientSecret: SECRETS.GOOGLE_CLIENT_SECRET,
    callbackURL: SECRETS.GOOGLE_REDIRECT_URI,
    passReqToCallback: true
  },
  function (request, accessToken, refreshToken, profile, done) {
    console.log(profile)
    console.log('Access Token: ' + accessToken)
    var usr = { google: { 'name': profile.displayName, 'token': accessToken } }
    // check if the user was already saved on the database
    User.search(usr.google.name, function (found, user) {
      if (found === true) {
        console.log('[passport.js] - Logged ' + user.google.name)
        return done(null, user)
      } else {
        // if user doesn't exists create it
        User.create(usr, function (result, user) {
          if (result) {
            console.log('[passport.js] Account google saved on db')
            return done(null, user)
          }
          console.log('[passport.js] failed to save google account')
          return done(null, false)
        })
      }
    })
  }
  ))
    
  passport.use(new LocalStrategy(
    function (username, password, done) {
      User.search({ username: username }, function (err, user) {
        if (err) { return done(err) }
        if (!user) { return done(null, false) }
        if (!user.verifyPassword(password)) { return done(null, false) }
        return done(null, user)
      })
    }
  ))

  // passport Strategy to register a new user
  passport.use('signup', new LocalStrategy({ passReqToCallback: true }, function (req, username, password, done) {
    // ensure there are only valid values
    var email = req.body.email
    const nome = req.body.nome
    const cognome = req.body.cognome

    if (typeof password === 'undefined' || typeof username === 'undefined' || typeof email === 'undefined') {
      console.log('[passport.js] invalid fields')
      return done(null, false, req.flash('signupMessage', 'missing username or password!'))
    }
    // check if the user doesn't already exist and create it
    var usr = { local: 
                      { 'username': username,
                        'name'    : nome,
                        'surname' : cognome, 
                        'password': User.createhash(password),
                        'email': email, 'IsConfirmed': false 
                      }
              }
    User.search(username, function (found, user) {
      // if the user exists abort and show message on page
      if (found) {
        done(null, false, req.flash('signupMessage', 'existing user!'))
      } else {
        User.create(usr, function (result, user) {
          if (result) {
            console.log('[passport.js] redirecting to profile')
            return done(null, user)
          }
          return done(null, false, req.flash('signupMessage', 'server error, failed to create the user!'))
        })
      }
    })
  }))

  // passport Strategy to log in a user
  passport.use('login', new LocalStrategy({ passReqToCallback: true }, function (req, username, password, done) {
    // ensure there are only valid values
    if (typeof password === 'undefined' || typeof username === 'undefined') {
      console.log('[passport.js] invalid fields')
      return done(null, false, req.flash('loginMessage', 'missing username or password!'))
    }
    // make a request to the database to get the userdata
    User.search(username, function (found, user) {
      // abort in case of unexisting user
      if (found === false) {
        return done(null, false, req.flash('loginMessage', 'wrong username'))
      } else {
        // verify user password
        User.check(user, password, function (verified) {
          if (verified) {
            return done(null, user)
          } else {
            return done(null, false, req.flash('loginMessage', 'wrong password'))
          }
        })
      }
    })
  }))
}
