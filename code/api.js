const routes = require('./routes.js')
const host = 'http://db:5984'
const db = host + '/event'

const dbFactory = require('./init_db.js')

module.exports = function(app,request,couch){

    app.get('/api/event/_all_docs', function (req, res) {
        request({
            url: db + '/_all_docs',
            method: 'GET'
          }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                
                res.json(JSON.parse(body))
            } else {
                console.log(error)
                res.send(400, error)
            }
          })
      })

      app.get('/api/event', function (req, res) {
        var query = {'selector': {} }   
        request({
            url: db + '/_find',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    res.json(JSON.parse(body))
                } else {
                    console.log(error)
                    res.send(400, error)
                }
          })
      })

      app.get('/api/event/:id', function (req, res) {
        var id = req.params.id
        request({
            url: db + '/' + id,
            method: 'GET'
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    res.json(JSON.parse(body))
                } else {
                    console.log(error)
                    res.status(400).send(error)
                }
          })
      })

      app.post('/api/event/:id', function (req, res) {
        var id = req.params.id;
        request({
            url: db + '/' + id,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
          }, function (error, response, body) {
            if (error) {
              console.log(error)
              res.status(400).send(error)
            }else{
                res.json(JSON.parse(body))
            }
          })

      })

      app.delete('/api/event/:id/:rev', function (req, res) {
        var id = req.params.id
        var rev = req.params.rev
        request({
            url: db + '/' + id + '?rev=' + rev,
            method: 'DELETE'
          }, function (error, response, body) {
            if (error) {
              console.log(error)
              res.send(400, error)
            }else{
                res.json(JSON.parse(body))
            }
          })

      })

      app.delete('/api/event/:id',function(req, res){
            var id = req.params.id
            couch.get("event", id).then(({data, headers, status}) => {
                console.log(data._rev)
                couch.del("event",id, data._rev).then((data2,headers2,status2) =>{
                    res.send(data2)
                }, err =>{
                    res.send(400,err)
                })
            }, err => {
                res.send(400, err)
            })
      })

}