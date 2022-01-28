const searchedPlaces = require('./searchedPlaces.js')
const Place = require('./place.js')
const Event = require('./event.js')
const Index = require('./index.js')
const saveLocalEvent = require('./save_local_event.js')
const getSavedEvent = require('./get_saved_event.js')
const saveDisplay = require('./save&display.js')
// const Calendar = require('./calendar.js')
const request = require('request')
const ow = require('./openWeather.js')
// var SECRETS = require('../secrets/secret')

module.exports = function (app, passport, amqp) {
  // use res.render to load up an ejs view file
  // index page
  app.get('/', function (req, res) {
    Index.send_page(req, res)
  })

  // about page
  app.get('/about', function (req, res) {
    res.render('pages/about')
  })

  app.get('/signup', function (req, res) {
    res.render('pages/signup')
  })
  // initiate signup procedure
  app.post('/signup', passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
  }))

  app.get('/login', function (req, res) {
    res.render('pages/login')
  })

  app.get('/save_local_event', function (req, res) {
    saveLocalEvent.send_page(req, res)
  })
  app.post('/save&display', isLoggedIn, function (req, res) {
    saveDisplay.send_page(req, res)
  })

  // initiate login procedure
  app.post('/login', passport.authenticate('login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }))

  // initiate OAuth2 login with Google credentials
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'] }))

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
      // Successful authentication, redirect home.
      console.log('[routes.js] - google auhtenticated\n' + res)
      res.redirect('/profile')
    })

  app.get('/place', function (req, res) {
    Place.send_page(req, res)
  })

  app.post('/places', function (req, res) {
    searchedPlaces.send_page(req, res)
  })

  app.get('/event', function (req, res) {
    Event.send_page(req, res, request)
  })

  app.post('/event/comment', function (req, res) {
    Event.send_comment(req, res, amqp)
  })

  app.get('/get_saved_event', function (req, res) {
    ow.get_weather(req, res, function (weather) {
      getSavedEvent.send_page(req, res, weather)
    })
  })

  // TEST improbabili
  app.get('/cacca', function (req, res) {
    res.render('pages/cacca')
  })
  // account profile, available only if the user has already logged
  app.get('/profile', isLoggedIn, function (req, res) {
    console.log('[routes.js] rendering profile view')
    res.render('pages/profile', { user: req.user })
  })
}

// callback which ensures hat the session is authenticated
function isLoggedIn (req, res, next) {
  console.log('[routes.js] - isLoggedIn call')
  console.log(req.user)
  if (req.isAuthenticated()) {
    if (req.user.local !== undefined) {
      if (req.user.local.IsConfirmed === true) {
        console.log('[routes.js] user logged')
        return next() // loads the page which was requested
      } else {
        console.log('[routes.js] user not confirmed, check email')
        // res.redirect('/login')
        return next()
      }
    } else if (req.user.google !== undefined) {
      console.log('[routes.js] user logged with google\n')
      return next() // loads the page which was requested
    } else {
      console.log('[routes.js] - isAuthenticated = true but not matched with Google OR Local')
      console.log(req.user)
      res.redirect('/') // redirects
    }
  } else {
    console.log('[routes.js] - isAuthenticated = false')
    res.redirect('/signup')
  }
}

module.exports.isLoggedIn = isLoggedIn
