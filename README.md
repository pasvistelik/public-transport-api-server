# PublicTransportProject
Поиск наилучших путей для движения на общественном транспорте.

#API
GET/ stations Список всех остановок.
GET/ routes Список всех маршрутов.
GET/ timetables Расписание движения транспорта.

GET/ optimalRoute?from=:from&to=:to&startTime=:startTime&dopTimeMinutes=:dopTimeMinutes&goingSpeed=:goingSpeed&transportTypes=:transportTypes
