var SECRETS = require('../secrets/secret')

const googleMapsClient = require('@google/maps').createClient({
  key: SECRETS.GOOGLE_TOKEN
})

googleMapsClient.geocode({
  address: '1600 Amphitheatre Parkway, Mountain View, CA'
}, function (err, response) {
  if (!err) {
    console.log(response.json.results)
  }
})
