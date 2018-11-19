/**
 * Add additional format output methods to global Array prototype.
 */

if (!Array.prototype.deduplicate) {

	Array.prototype.deduplicate = function (arg) {
	
		if ('string' === typeof arg && this.every(isAnObjectWithThisProperty, arg)) {
		
			return this.filter((obj, pos, arr) => {
			
				return arr.map(mapObj => mapObj[arg]).indexOf(obj[arg], (pos+1)) === -1;
		
			});
	
		}
		else if ('number' === typeof arg && Number.isInteger(arg) && this.every(isAnArrayWithThisIndexDefined, arg)) {
		
			var arrayMap = this.map(mapArray => mapArray[arg]);
			var filteredArray = this.filter((el, pos, arr) => {
				let isUnq = arrayMap.indexOf(el[arg], (pos+1)) === -1;
				return isUnq;
// 				return arr.map(mapArray => mapArray[arg]).indexOf(el[arg], (pos+1)) === pos;
		
			});
			return filteredArray;
		
		}
		else if (this.every(isAPrimitive)) {
		
			return Array.from(new Set(this));
		
		}
		else {
		
			return this;
		
		}
	
	}

}

if (!Array.prototype.removeHashedElement) {

	Array.prototype.removeHashedElement = function (arg) {
	
		return this.filter((el) => {
		
			let argHash = arg.splice(el.length);
			return JSON.stringify(el) !== JSON.stringify(arg);
	
		});
	
	};

}

function isAnObjectWithThisProperty(el) {

	const gp = this;
	return (isAnObject(el) && hasGivenProperty(el, gp));

}

function isAnArrayWithThisIndexDefined(el) {

	const indx = this;
	return (isAnObject(el) && Array.isArray(el) && indexIsDefined(el, indx));

}

function indexIsDefined(arrayEl, index) {

	return ('undefined' !== typeof arrayEl[index]);

}

function isAnObject(el) {

	return ('object' === typeof el);

}

function hasGivenProperty(el, prop) {

	return (el.hasOwnProperty(prop));

}

function isAPrimitive(el) {

	if (el === null || el === undefined) {
	
		return true
	
	}
	else {
	
		switch (typeof el) {

			case 'string': 
			case 'number':
			case 'symbol':
			case 'boolean': 
				return true;
				break;
			default: 
				return false;
		
		}
	
	}

}
