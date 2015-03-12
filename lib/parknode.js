var parknode = {},
	u_id=0,
	sockets	={},
	HEAD_LENGTH	=18,
	V_START	= 0x7B,
	V_END	= 0x7D,
	V_HIDE	= 0x40,
	V_CTRL_HOP	= 0x30,
	V_CTRL_TIME	= 0xC5,
	V_OP_READ = 0x55,
	V_OP_READ_RES	=	0xAA,
	V_OP_WRITE	=	0xE6,
	V_OP_WRITE_RES	=	0x66,
	V_OP_ACK	=	0x88,
	logger	=	require('../logger'),
	config	=	require('../config'),
	async	=	require('async'),
	redis	=	require('redis');

/**
 * print buffer as hex string with space
 */
function printHexString(buffer) {
	var string = buffer.toString('hex', 0, 1).toUpperCase();
	for (var i = 1; i < buffer.length; i++) {
		string += ' ' + buffer.toString('hex', i, i + 1).toUpperCase();
	}

	return string;
}

/**
 * 重置时间
 */
function resetDate(socket) {
	console.log('start reset time...');

	var headData = {
		head : V_START,
		deviceType : 0x50,
		frameType : 0x01,
		flag : 0,
		seq : socket.seq++,
		dstAddr : 0,
		srcAddr : 1,
		ctrlCode : V_CTRL_TIME,
		opType : V_OP_WRITE_RES,
		dataLen : 6
	};
}

parknode.addSocket = function(socket) {
	socket.id = u_id++;
	socket.seq = 1;
	sockets[socket.id] = socket;
	socket.body = {};
	socket.body.name = 'FALLBACK_GW';
	socket.head = {};
	resetDate(socket);

	// 每12小时重置一次市时间
	socket.intervalId = setInterval(function() {
		resetDate(socket);
	}, 12 * 60 * 60 * 1000);
	return socket.id;
};

parknode.deleteSocket = function(id) {
	if (sockets[id]) {
		logger.info('[server] remove socket: ' + sockets[id].body.name);

		// 停止重置任务
		clearInterval(sockets[id].intervalId);
		sockets[id].destroy();
		delete sockets[id];

		return true;
	}

	return false;
};

parknode.handler = function(buffer, socket) {
	var remote = socket.remoteAddress + ':' + socket.remotePort;
	socket.date_lastCommunicate = new Date();
	logger.info('[RCV ' + remote + '] BUFFER= ' + buffer);

    var lines = buffer.toString('UTF-8').split(",");
    var len = lines.length;
    var busi_flag = lines[0];
    
	var card_no;
	var in_time;
	var car_no;
	var out_device;
	var in_device;
	var fee;
	var fee_type;
	var redis_status=true;
	
//	var client = redis.createClient(config.redis_port,config.redis_ip,{connect_timeout:1}); 
//	 
//	client.on('error',function(error){
//			redis_status=false;
//			logger.info(error);
//	});
    
    if(busi_flag==='0') {
    	// 进场记录数据 上发接口  ，格式为  进出场标识（0）+ PARK_ID+卡号 + 进场时间+ 车牌号码+ 入口  
    	logger.error('[UP in data');
    	if(len!== 6){
    		logger.error('[UP in data ERR!,  RECORD[' + buffer + '].');
    		return 'E001. in data format err,RECORD[' + buffer + '].';
    	}
    	
    	card_no=lines[1];
		in_time	=lines[2];
		car_no	=lines[3];
		in_device=lines[4];
		
		//get & set
//		if(redis_status) {
//			client.set(lines[1]+','+lines[2], lines, function(err, response) {
//			    if (err) {
//			        logger.info('Failed to set key of roban, error:' + err);
//			    }
//			 
//			    client.get(lines[1]+','+lines[2],function(errGet,responseGet){
//			        logger.info('Val:'+responseGet);
//			    });
//			 
//			});
//		}
		
		return 'S001\n';
    }
    	 
	if(busi_flag==='1'){// 出场记录数据上发接口  ，格式为  出场标识（1）+ PARK_ID+卡号 + 进场时间+ 车牌号码+ 出口+驶出时间+收费+收费类型
		logger.error('[UP out data');
		if(len!==8){
			logger.error('[UP out data ERR!,  RECORD' + buffer + '].');
			return 'E002, out data format err,RECORD[' + buffer + '].';
		}
		logger.error('[UP out data, analyze...');
		card_no=lines[1];
		in_time=lines[2];
		car_no=lines[3];
		out_device = lines[4];
		fee = lines[5];
		fee_type = lines[6];

		logger.error('[UP out data, analyze...finished');
    	return 'S002\n';
	}

    if(busi_flag==='2'){
    	// 出场记录数据 查询接口 ，格式为  : 查询标识（2）+PARK_ID+卡号 + 进场时间+ 车牌号码
    	logger.error('[UP qry data');
    	if(len!==5){
    		logger.error('[QUERY out data ERR!,  RECORD' + buffer + '].');
    		return 'E003,query data format err, RECORD[' + buffer + '].';
    	}
    	card_no = lines[1];
    	in_time = lines[2];
    	car_no = lines[3];

    	return 'S003\n';
    }
	
    logger.error('E004,unkown data, RECORD[' + buffer + '].');
    return  'E004,failure,format error\n';
    
//	var client =require('mysql').createConnection({'host':'localhost','port':3306,'user':'root','password':'!23qweasd','database':'test'});  
    //
    //	
//    	client.query('INSERT INTO TEST VALUES(\''+buffer+'\')', function selectCb(err,results) {
//    		if (err) {
//    			logger.error(err);
//    			return 'db err.'
//    		}
//    		logger.info("insert into mysql success");
//    		console.log(results);
//    	});
//    	client.end();

//

};

//try {
//// 帧解析 && 去转义
//var start = -1, end = 0, noFrame = true;
//for (var i = 0; i < buffer.length; i++, end++) {
//	buffer[end] = buffer[i];
//	if (buffer[end] == V_START)
//		start = end;
//	if (buffer[end] == V_END && start > -1) {
//		// handleFrame(buffer.slice(start, end + 1), socket);
//		noFrame = false;
//		start = -1;
//	}
//	if (buffer[end] == V_HIDE && ++i < buffer.length)
//		buffer[end] = V_HIDE ^ buffer[i];
//}
//
//// error handler
//if (noFrame) {
//	return logger.error('[ERR ' + remote + '] unexpected data');
//}
//
//} catch (err) {
//logger.error(err);
//}s

module.exports = parknode;