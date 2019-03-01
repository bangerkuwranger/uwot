/**
 * Add additional case management methods to global String prototype.
 */

if (!String.prototype.toCamel) {

	String.prototype.toCamel = function () {
	
		return this.trim().replace(/( )/g, '_').replace(/(_[a-zA-Z])/g, function ($1) {
		
			return $1.toUpperCase().replace('_', '');
		
		}).replace(/[^a-zA-Z]/g, '');
	
	};

}

if (!String.prototype.toUnderscore) {

	String.prototype.toUnderscore = function () {
	
		return this.trim().replace(/([A-Z])/g, function ($1) {
		
			return "_" + $1.toLowerCase();
		
		}).replace(/( )/g, '_').replace(/[^a-zA-Z_]/g, '').replace(/_+/g, '_').replace(/_+$/, '');
	
	};

}

if (!String.prototype.toCrArray) {

	String.prototype.toCrArray = function() {
	
		return this.split(/[\r\n]+/);
	
	};

}
