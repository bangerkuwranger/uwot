var fs = require('fs');
var path = require('path');
var winston = require('winston');
var expressWinston = require('express-winston');

var varDir = path.resolve(global.appRoot, 'var');
var logDir = path.resolve(varDir, 'log');

if (!fs.existsSync(varDir)) {

	fs.mkdirSync(varDir);

}
if (!fs.existsSync(logDir)) {

	fs.mkdirSync(logDir);

}
var errorLog = path.resolve(logDir, 'error.log');
var infoLog = path.resolve(logDir, 'info.log');

module.exports = {
	'info': expressWinston.logger({
		transports: [
			new winston.transports.File({
				level: 'info',
				colorize: false,
				timestamp: true,
				filename: infoLog,
				maxsize: 1049000,
				maxFiles: 10,
				prettyPrint: true,
				showLevel: false,
				tailable: true,
				zippedArchive: true
			}),
			new winston.transports.Console({
				level: 'info',
				colorize: true,
				timestamp: true,
				json: true,
				prettyPrint: true
			})
		]
	}),
	'error': expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
    	level: 'error',
    	colorize: false,
    	timestamp: true,
    	filename: errorLog,
    	maxsize: 819200,
    	maxFiles: 10,
		prettyPrint: true,
    	showLevel: false,
    	tailable: true,
    	zippedArchive: true
    }),
    new winston.transports.Console({
		level: 'error',
		colorize: true,
		timestamp: true,
		json: true,
		prettyPrint: true
    })
  ]
})
}