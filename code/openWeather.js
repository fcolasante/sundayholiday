var SECRETS = require('../secrets/secret')
const request = require('request')

var get_weather = function(req, res, weather){
let lat = req.lat
let lng = req.lng
let apiKey = SECRETS.OPENWEATHER.OPENWEATHER_APPID
//api.openweathermap.org/data/2.5/weather?lat=35&lon=139
//let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
let url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}`

  request(url, function (err, response, body) {
    if(err){
      res.render('pages/index', {results: 'fail'});
    } else {
      let result = JSON.parse(body)
      console.log('[openWeather.js] - going to print weather object ...')
      //console.log(result)
      
        console.log(result)
        return weather(result)
      
    }
  })
};

module.exports.get_weather = get_weather
