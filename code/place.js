var SECRETS = require('../secrets/secret')
const request = require('request')
const async = require('async')

var API_MAPS_PLACES_DETAILS = 'https://maps.googleapis.com/maps/api/place/details/json?placeid='
var API_FB_PLACES = 'https://graph.facebook.com/v3.2/search?type=place&'  //standard fb API URL

var obj;	//conterrà la risposta di google
var fb_info;	//conterrà la risposta di fb

var get_obj = function (req, res) {
    var name = req.query.name;
    var data = req.query.data;
	var place_id = req.query.id
	var lat = req.query.lat
	var lng = req.query.lng
	//console.log(place_id)
	var URL_GOOGLE = API_MAPS_PLACES_DETAILS + place_id 
					+"&fields=name,rating,formatted_phone_number,formatted_address,opening_hours,reviews,geometry/location/lat,geometry/location/lng"
					+'&key=' + SECRETS.GOOGLE_API_KEY
	// chiamate parallele
    async.parallel([
		getGoogleInfo = function(callback){
			request({
				url: URL_GOOGLE,
				method: 'GET'
				}, function (error, response, body) {
					if (!error) {
						console.log('################################### Google Places OK!');
						obj = JSON.parse(body);
						callback(null,obj)
					} 
					else {
						console.log("################################### Error in get_obj")
						console.log(error);
						res.render('/');
					}
				}
			)
		},
		getFbInfo = function(callback) {            
		//parametri per la costruzione dell'URL
		var fb_coordinates = "center=" + lat + ',' + lng + '&distance=1000&q=' + name;   //NOTA: forse inserire q=name sminchia tutto
		var fb_requested_fields = "&fields=name,link,cover,description"  //richiedo il nome, il link al profilo fb, l'immagine
		var fb_optional = "&limit=3"   //limita i risultati a 3
		var URL_FACEBOOK = API_FB_PLACES + fb_coordinates + fb_requested_fields + fb_optional + "&access_token=" + SECRETS.FACEBOOK_APP_ID
		request({   //cerca il luogo su fb, da aggiungere la ricerca degli eventi correlati
			url: URL_FACEBOOK,
			method: 'GET'
			}, function (error, response, body){
			if (!error){                        
				fb_info = JSON.parse(body);  //se non vado in errore parso l'oggetto; i campi richiesti sono disponibili per essere usati nella pagina html
				console.log('################################### Facebook Places OK!');
				callback(null,fb_info)
			}
			else {
				console.log("################################### Error in getFbInfo")
				console.log(error);
				res.render('pages/cacca')
			}
		})
	}
	/* funzione che prende i dati da openWeather */
	],
	//funzione da eseguire al completamento di tutte le chiamate parallele (results è un array che deve contenere le risposte alle GET)
    	function(err, results) {
			var google = results[0]
			var facebook = results[1]
			// var opneWeather = results[2]
    		if (!err && google.result != undefined && facebook.data != undefined /*&& openWeather obj != undefined*/){
				console.log("[place.js] - going to print g_data parsed...")
				console.log(results[0])
				console.log("[place.js] - going to print fb_data parsed...")
				console.log(results[1])
				res.render('pages/place', { g_data: google.result,
											fb_data: facebook.data,
											//openWeather object
											}) 
				}
				else{
					console.log("[place.js] - Errore nell'handling async.parallel")
					console.log("Google:")
					console.log(google)

					console.log("Facebook:")
					console.log(facebook)
					res.render('pages/cacca');
				}
		})
};

module.exports.send_page = get_obj
