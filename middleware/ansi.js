var ansi = require('../output/ansi').outputAnsi;

module.exports = function(args) {

	return function(req, res, next) {
	
		res.ansi = ansi;
		next();
	
	};

};
