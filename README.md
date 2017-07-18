# PublicTransportProject
Поиск наилучших путей для движения на общественном транспорте.

# API
GET/ stations Список всех остановок.

GET/ routes Список всех маршрутов.

GET/ timetables Расписание движения транспорта.

GET/ optimalRoute?from=:from&to=:to&startTime=:startTime&dopTimeMinutes=:dopTimeMinutes&goingSpeed=:goingSpeed&transportTypes=:transportTypes

# Серверная часть
https://github.com/pasvistelik/myapp

Server API demo links: 

https://public-transport-api-server.herokuapp.com/routes

https://public-transport-api-server.herokuapp.com/stations

https://public-transport-api-server.herokuapp.com/timetables

https://public-transport-api-server.herokuapp.com/OptimalRoute?from=53.7082,23.8029&to=53.6568,23.8568&startTime=20:35&dopTimeMinutes=2&goingSpeed=5&transportTypes=bus,trolleybus
# Клиентская часть
https://github.com/pasvistelik/react-app

Client demo link: https://publictransportproject.000webhostapp.com/
