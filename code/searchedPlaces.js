var API_MAPS_PLACES = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query='
var SECRETS = require('../secrets/secret')
const request = require('request')

var places = function (req, res) {
  var searchedText = req.body.selectedPlace
  console.log(searchedText)
  request({
    url: API_MAPS_PLACES + searchedText + '&key=' + SECRETS.GOOGLE_API_KEY,
    method: 'GET'
  }, function (error, response, body) {
    if (!error) {
      console.log(body)
      var obj = JSON.parse(body)

      res.render('pages/placeList', { results: obj.results })
    } else {
      console.log(error)
      res.render('/')
    }
  })
}

module.exports.send_page = places
