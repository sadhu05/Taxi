var config  = require('./config.json');
var dbconn  = 'mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.name;

var mongo   = require('mongodb').MongoClient;

var connection;

mongo.connect(dbconn, function (err, db) {
	if (err) {
		console.error(err);
		process.exit(1);
	}

	connection = db;
});

module.exports = function (err) {
	if (typeof connection === 'undefined') {
		throw new Error('Mongo Connection Pending' + err);
	}

	return connection;
};