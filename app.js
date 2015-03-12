
/**
 * parknode  by qiuzq
 */
// app.js 
var net = require('net')
	, parknode = require('./lib/parknode')
	, config = require('./config')
	, logger = require('./logger')
	, http = require('http');

var headers = {'Content-Type': 'text/xml; charset=utf-8'};
var options = {
		host: "localhost",
		port: 8081,
		path: "/NewMsgProc/services/Transfers",
		method: 'POST',
		headers: headers
	};

var server = net.createServer(function(socket){
	var remote = socket.remoteAddress + ':' + socket.remotePort;
	logger.info('[server] ' +remote + ' connect!');
	socket.date_connect = socket.date_lastCommunicate = new Date();
	socket.setTimeout(10*60*1000);
	var id = parknode.addSocket(socket);

	socket.on('timeout', function(){
		logger.info('[server] ' + remote + ' timeout!');
		parknode.deleteSocket(id);
	});

	socket.on('data', function(data){
		var msg = parknode.handler(data, socket);
		socket.write('response: ' + msg);
        var req=http.request(options,function(res){
            console.log("request...");
        });
        req.write("hello world");
	});

	socket.on('end', function(){
		logger.info('[server] ' +remote + ' disconnect!');
		parknode.deleteSocket(id);
	});

	socket.on('error', function(e){
		logger.error('[server] ' + e);
		parknode.deleteSocket(id);
	});

}).listen(config.tcp_port);


