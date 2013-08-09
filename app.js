/**
 * Module dependencies.
 */
var express = require('express')

  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express(),
		server = http.createServer(app),
		io	= require('socket.io').listen(server),

		mysql	= require('mysql'),
		connectionsArray	= [],
		connection			= mysql.createConnection({
			host		: 'localhost',
			user		: 'root',
			password	: '',
			database	: 'nodejs-MySQL-push-notifications-demo'
		}),
		POLLING_INTERVAL = 3000,
		pollingTimer;

// all environments
app.configure(function() {
	app.set('port', process.env.PORT || 3000);

	app.locals({
        web_title : 'Sample Node Push Notif with Mysql and Socket.io'
    });

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

connection.connect(function(err) {
  // connected! (unless `err` is set)
  if(err)
  	console.log( err );
});

var pollingLoop = function () {
	
	// Doing the database query
	var query = connection.query('SELECT * FROM users'),
		users = []; // this array will contain the result of our db query

	// setting the query listeners
	query
	.on('error', function(err) {
		// Handle error, and 'end' event will be emitted after this as well
		console.log( err );
		updateSockets( err );
	})
	.on('result', function( user ) {
		// it fills our array looping on each user row inside the db
		users.push( user );
	})
	.on('end',function(){
		// loop on itself only if there are sockets still connected
		if(connectionsArray.length) {
			pollingTimer = setTimeout( pollingLoop, POLLING_INTERVAL );

			updateSockets({users:users});
		}
	});

};


// creating a new websocket to keep the content updated without any AJAX request
io.sockets.on( 'connection', function ( socket ) {
	
	console.log('Number of connections:' + connectionsArray.length);
	// starting the loop only if at least there is one user connected
	if (!connectionsArray.length) {
		pollingLoop();
	}
	
	socket.on('disconnect', function () {
		var socketIndex = connectionsArray.indexOf( socket );
		console.log('socket = ' + socketIndex + ' disconnected');
		if (socketIndex >= 0) {
			connectionsArray.splice( socketIndex, 1 );
		}
	});

	console.log( 'A new socket is connected!' );
	connectionsArray.push( socket );
	
});

var updateSockets = function ( data ) {
	// adding the time of the last update
	data.time = new Date();
	// sending new data to all the sockets connected
	connectionsArray.forEach(function( tmpSocket ){
		tmpSocket.emit( 'startup' , data );
	});
};


app.get('/', routes.index);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
