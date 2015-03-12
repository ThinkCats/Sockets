var config = {
	  nodename:  		'parknode_lp'																			// 为这台noc server取个名字
	, tcp_port : 		8898																						// tcp port
	, http_port :		2901																						// http port
	, pwd : 				'123456'																				// password for admin user
	, wb_host :			'127.0.0.1'																	// web service host
	, wb_port : 		8080
	, wb_path :			'/EventForwarderService/EventForwarder'					// web service path
	, log_monitor:  'http://202.75.218.30:2902'											// log monitor address
	, log_server: 	'http://202.75.218.30:2903'											// log server address
	, mysql_ip: '127.0.0.1'
	, mysql_port:3306
	, mysql_user: 'root'
	, mysql_password: '!23qweasd'
	, mysql_db: 'test'
	, redis_ip: '192.168.1.113'
	, redis_port: 6379
}

module.exports = config;
