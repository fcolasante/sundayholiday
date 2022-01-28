// funzione che quando viene premuto il bottone 'Salva l'evento sul sito' nella pagina place.ejs
// manda l'utente nella pagina save_local_event.ejs e invia i dati del luogo, data e meteo raccolti prima
const ow = require('./openWeather.js')
var save_local_event = function(req, res){
	console.log("[save_local_event] - going to print req.query ...")
	console.log(req.query)
	console.log("[save_local_event] - going to get weather ...")
	ow.get_weather(req.query, res, function(weather){
		res.render("pages/save_local_event", {result: req.query, weather: weather})	
	})
}
module.exports.send_page = save_local_event