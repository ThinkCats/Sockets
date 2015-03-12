/**
 * log4js
 */
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' }, //控制台输出
    {
      type: 'file', //文件输出
      filename: 'logs/access.log', 
      maxLogSize: 10240000, //10M
      backups:3,
      category: 'normal' 
    }
  ]
});
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');

module.exports = logger;