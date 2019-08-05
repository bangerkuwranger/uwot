var ansi = require('../output/ansi');

module.exports = function(args) {

	return function(req, res, next) {
	
		res.ansi = function outputAnsi(obj) {
		
			return this.json(ansi(obj));
		
		};
		next();
	
	};

};
