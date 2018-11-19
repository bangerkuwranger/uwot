/**
 * Add additional format output methods to global Date prototype.
 */

if (!Date.prototype.toMySqlString) {

	Date.prototype.toMySqlString = function () {
	
		return this.toISOString().substring(0, 19).replace('T', ' ');
	
	};

}

if (!Date.prototype.toCsvString) {

	Date.prototype.toCsvString = function () {
	
		return this.toISOString().substring(0, 19).replace('T', ' ') + ' UTC';
	
	};

}
