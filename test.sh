 
 echo -e '\n 0.Find all event'
 curl -X GET "http://localhost:8080/api/event" -H "accept: application/json"


 echo -e '\n\n\n 1.Find event with _id = 1000'
 curl -X GET "http://localhost:8080/api/event/1000" -H "accept: application/json"



 echo -e '\n 2.Create event with _id = 1000'
curl -X POST "http://localhost:8080/api/event/1000" -H "accept: */*" -H "Content-Type: application/json" -d '{"name":"Gità al lago","location":"Trasimeno","date":"21/12/2019","description":"La gita sarà organizzata da AlpiTour, incontro alle 6:30"}'

 echo -e '\n 2.Create event with _id = 1001'
curl -X POST "http://localhost:8080/api/event/1001" -H "accept: */*" -H "Content-Type: application/json" -d '{"name":"Gità in Montagna","location":"Maiella","date":"21/12/2019","description":"La gita sarà organizzata da Peter, incontro alle 4:30"}'

echo -e '\n\n 3.Find event with _id = 1000'
 curl -X GET "http://localhost:8080/api/event/1000" -H "accept: application/json"


echo -e '\n\n 3.Find event with _id = 1001'
 curl -X GET "http://localhost:8080/api/event/1001" -H "accept: application/json"

echo  -e '\n 3.DELETE event 1000'
curl -X DELETE "http://localhost:8080/api/event/1000" -H "accept: */*"

echo  -e '\n 3.DELETE event 1001'
curl -X DELETE "http://localhost:8080/api/event/1001" -H "accept: */*"
