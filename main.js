var config = require('./config.json');
var db = require('./db');
var dbconn = 'mongodb://' + config.mongo.host + ':' + config.mongo.port + '/';
var ObjectID = require('mongodb').ObjectID;
var mongo = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
       
const express = require('express');
const app = express();
var path = require('path');
var g_obj = {};


app.listen(config.server.port, function () {
  console.log('TaxiService App listening on port 88!');
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/user', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/user.html'));
});

app.get('/driver', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/driver.html'));
});

app.post('/requestCar', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    console.log(req.body.user);
    var user = JSON.parse(req.body.user);
    console.log(user);
    var dist = [];
    var collection = db().collection("users");
    collection.find({"userType": 'Driver'})
    .toArray(function (err, data) {
        if (!err) {
            //var temp = data[0].recentClients;
            //temp[clientName] = clientName;
            //collection.update({"username": agentName}, {'$set': {'recentClients': temp}});
            //for(var i=0; i<data.length; i++){
                //distance(user.);
                //console.log(data);
                //var d = distance(user.location.latitude, user.location.longitude, data.location.latitude, data.location.longitude, 'K');
                
                    var obj = {
                        user : user.userId,
                        driver: data[0].userId
                        //distance: d
                    };
                
                //dist.push(obj);
            //}
            
            //res.status(204).end();
            /*dist.sort(function(a, b){ 
                return a.distant.localeCompare(b.distant); 
            });
            return dist;*/
            console.log(obj);
            res.send(obj);
        } else {
            res.status(500).end();
        }
    });
    
});

function generateId(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

app.post('/registerUser', function(req, res){
    res.setHeader('Content-Type', 'application/json');
    var collection = db().collection('users');
    console.log("came here");
    var saveObj = {
            'userId'    : req.body.userId,
            'username'  : req.body.username,
            'location'  : {latitude: req.body.latitude, longitude: req.body.longitude},            
            'isOccupied': false,
            'userType'  : 'User'
    };
    collection.find({
                'userId' : req.body.userId
    }).toArray(function (err, data) {
            if (data.length !== 0) {
                    res.send(JSON.stringify({
                        user: saveObj,
                        message: 'user already exists'
                    }));
            } else {
                    
                    collection.insert(saveObj);
                    res.send(JSON.stringify({
                        user: saveObj,
                        message: 'user registered'
                    }));
            }
    });
});

app.post('/registerDriver', function(req, res){
    res.setHeader('Content-Type', 'application/json');
    var collection = db().collection('users');
    console.log("came here");
    var saveObj = {
            'userId'    : req.body.driverId,
            'username'  : req.body.drivername,
            'location'  : {latitude: req.body.latitude, longitude: req.body.longitude},
            'userType'  : 'Driver',
            'isPink'    : req.body.isPink,
            'isOccupied': false
    };
    collection.find({
                'userId' : req.body.driverId
    }).toArray(function (err, data) {
            if (data.length !== 0) {
                    res.send(JSON.stringify({
                        user: saveObj,
                        message: 'Driver already exists'
                    }));
            } else {
                    
                    collection.insert(saveObj);
                    res.send(JSON.stringify({
                        user: saveObj,
                        message: 'Driver registered'
                    }));
            }
    });
});

app.post('/updateLocation', function(req, res){
    res.setHeader('Content-Type', 'application/json');
    var collection = db().collection('users');
    console.log("came here");
    var saveObj = {
            'location'    : {
                latitude  : req.body.latitude,
                longitude : req.body.longitude
            }
    };
    collection.find({
                'userId' : req.body.uid
    }).toArray(function (err, data) {
                collection.update(saveObj);
                res.send(saveObj);
    });
});

app.post('/startTrip', function (req, res) {
  console.log("yyyyyy");
    var collection = db().collection('users');
    console.log("came here "+req.body.user);
    var saveObj = {
            isOccupied: true,
            trip : {
                tripId: generateId(5, '1234567890'),
                user: req.body.user,
                driver: req.body.driver,
            }
    };
    g_obj[saveObj.trip.tripId] = {
        tripId : saveObj.trip.tripId,
        user : saveObj.trip.user,
        driver : saveObj.trip.driver
    };
    
    
    collection.find({
                'userId' : req.body.user
    }).toArray(function (err, data) {
                collection.update(saveObj);
                
                //res.send(saveObj);
    });
    collection.find({
                'userId' : req.body.driver
    }).toArray(function (err, data) {
                collection.update(saveObj);
                
                res.send(saveObj);
    });
});

app.post('/stopTrip', function (req, res) {
    var collection = db().collection('users');
    console.log("came here222");
    var saveObj = {
            'location'    : {
                latitude  : req.body.latitude,
                longitude : req.body.longitude
            },
            isOccupied: false
    };
    delete g_obj[req.body.tripId]; 
    collection.find({
                'userId' : req.body.user
    }).toArray(function (err, data) {
                collection.update(saveObj);
                
                //res.send(saveObj);
    });
    collection.find({
                'userId' : req.body.driver
    }).toArray(function (err, data) {
                collection.update(saveObj);
                
                res.send(saveObj);
    });
});



function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist;
}
