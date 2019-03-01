var expressWinston = require('express-winston');
var transports = require('../logger').transports;

module.exports = {
	'error': expressWinston.errorLogger({
		transports: [
			transports.errorFile,
			transports.errorConsole
		]
	}),
	'info': expressWinston.logger({
		transports: [
			transports.infoFile,
			transports.infoConsole
		]
	}),
	'debug': expressWinston.logger({
		transports: [
			transports.debugFile,
			transports.debugConsole
		]
	})
};
