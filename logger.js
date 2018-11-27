var fs = require('fs');
var path = require('path');
var winston = require('winston');

const varDir = path.resolve('./var');
const logDir = path.resolve(varDir, 'log');

if (!fs.existsSync(varDir)) {

	fs.mkdirSync(varDir);

}
if (!fs.existsSync(logDir)) {

	fs.mkdirSync(logDir);

}

var errorLog = path.resolve(logDir, 'error.log');
var infoLog = path.resolve(logDir, 'info.log');
var debugLog = path.resolve(logDir, 'debug.log');

var fileFormat = winston.format.combine(
	winston.format.simple(),
	winston.format.timestamp(),
	winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);
var consoleFormat = winston.format.cli({colors:{ debug:'green', info: 'blue', error: 'red' }, all: true});

var errorFileTransport = new winston.transports.File({
	level: 'error',
	filename: errorLog,
	maxsize: 819200,
	maxFiles: 10,
	tailable: true,
	zippedArchive: true
});

var infoFileTransport = new winston.transports.File({
	level: 'info',
	filename: infoLog,
	maxsize: 1049000,
	maxFiles: 10,
	tailable: true,
	zippedArchive: true
});

var debugFileTransport = new winston.transports.File({
	level: 'debug',
	filename: debugLog,
	maxsize: 2098000,
	maxFiles: 10,
	tailable: true,
	zippedArchive: true
});

var errorConsoleTransport = new winston.transports.Console({
	level: 'error'
});

var infoConsoleTransport = new winston.transports.Console({
	level: 'info'
});

var debugConsoleTransport = new winston.transports.Console({
	level: 'debug'
});

module.exports = {
	'formats': {
		'file': fileFormat,
		'console': consoleFormat
	},
	'transports': {
		'errorFile': errorFileTransport,
		'infoFile': infoFileTransport,
		'debugFile': debugFileTransport,
		'errorConsole': errorConsoleTransport,
		'infoConsole': infoConsoleTransport,
		'debugConsole': debugConsoleTransport
	},
	'all': winston.createLogger({
		transports: [
			errorFileTransport,
			errorConsoleTransport,
			infoFileTransport,
			infoConsoleTransport,
			debugFileTransport,
			debugConsoleTransport
		]
	}),
	'file': winston.createLogger({
		format: fileFormat,
		transports: [
			errorFileTransport,
			infoFileTransport,
			debugFileTransport
		]
	}),
	'console': winston.createLogger({
		format: consoleFormat,
		transports: [
			errorFileTransport,
			infoFileTransport,
			debugFileTransport
		]
	}),
}
