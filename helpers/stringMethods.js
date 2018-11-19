/**
 * Add additional case management methods to global String prototype.
 */

if (!String.prototype.toCamel) {

	String.prototype.toCamel = function () {
	
		return this.replace(/(_[a-zA-Z])/g, function ($1) {
		
			return $1.toUpperCase().replace('_', '');
		
		});
	
	};

}

if (!String.prototype.toUnderscore) {

	String.prototype.toUnderscore = function () {
	
		return this.replace(/([A-Z])/g, function ($1) {
		
			return "_" + $1.toLowerCase();
		
		});
	
	};

}

if (!String.prototype.toCrArray) {

	String.prototype.toCrArray = function() {
	
		return this.split(/[\r\n]+/);
	
	}

}
