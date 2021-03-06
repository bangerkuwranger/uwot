require('./dateMethods');
require('./stringMethods');
// require('./arrayMethods');
module.exports = {

	stringNoSpaces: function stringNoSpaces(value, format) {
	
		if ('undefined' === typeof value || null === value) {
		
			return '';
		
		}
		else if ('string' !== typeof value) {
		
			value = value.toString().trim();
		
		}
		else {
		
			value = value.trim();
		
		}
		// these trims and space subs are superfluous now that stringMethods perform them
		value = value.split(' ').join('_');
		if ('string' !== typeof format) {
		
			format = 'cc';
		
		}
		//these stringMethods should probably provide bool to turn on nums...
		switch(format) {
		
			case 'us':
				value = value.toUnderscore();
				break;
			default:
				value = value.toCamel();
				
		}
		return value;
	
	},
	
	cleanString: function cleanString(value, length, defaultValue) {
	
		if ('number' !== typeof length || 1 > length) {
		
			length = 255;
		
		}
		else {
		
			length = parseInt(length);
		
		}
		if ('string' !== typeof defaultValue) {
		
			defaultValue = null;
		
		}
		if ('undefined' === typeof value) {
		
			return defaultValue;
		
		}
		else {
		
			if ('string' !== typeof value && null !== value) {
		
				value = value.toString();
		
			}
			if (null === value) {
			
				return null;
			
			}
			else {
			
				return value.trim().substring(0, length);
			
			}
				
		
		}
		
	},
	
	cleanInt: function cleanInt(value, defaultValue, format) {
	
		if ('number' !== typeof defaultValue) {
		
			if ('undefined' !== typeof defaultValue && null === defaultValue) {
			
				defaultValue = null;
			
			}
			else {
			
				defaultValue = 0;
			
			}
		
		}
		var valueInt = ('undefined' !== typeof value && Number.isInteger(parseInt(value))) ? parseInt(value) : defaultValue;
		if ('undefined' !== typeof value && null === value) {
		
			value = null;
		
		}
		else {
		
			value = (isNaN(valueInt) || valueInt < defaultValue) ? defaultValue : valueInt;
		
		}
		if ('string' !== typeof format) {
		
			return value;
		
		}
		else {
		
			switch (format) {
			
				case 'db':
					if (null === value) {
					
						return null;
					
					}
					else {
					
						value = ('string' === typeof value) ? parseInt(value) : value;
						return (Number.isInteger(value)) ? value : defaultValue;
					
					}
					break;
				case 'csv':
					if (null === value) {
					
						return '';
					
					}
					else {
					
						defaultValue = null === defaultValue ? '' : defaultValue;
						value = ('number' === typeof value) ? value.toString() : value;
						return ('string' === typeof value) ? value : defaultValue;
					
					}
					break;
				default:
					return value;
			
			}
		
		}
	
	},
	
	cleanFloat: function cleanFloat(value, defaultValue, format) {
	
		if ('number' !== typeof defaultValue) {
		
			defaultValue = 0.0000;
		
		}
		var useNull = value === null;
		var valueFloat = ('number' === typeof value || !(isNaN(parseFloat(value)))) ? parseFloat(value) : defaultValue;
		value = (isNaN(valueFloat)) ? parseFloat(defaultValue.toFixed(4)) : parseFloat(valueFloat.toFixed(4));
		if ('string' !== typeof format) {
		
			return value;
		
		}
		else {
		
			switch (format) {
			
				case 'db':
					return ('string' === typeof value) ? parseFloat(value) : value;
					break;
				case 'csv':
					if (useNull) {
					
						return '';
					
					}
					else {
					
						value = ('number' === typeof value) ? value.toFixed(4) : value.toString();
						return (null === value || 'null' === value) ? '': value;
					
					}
					break;
				default:
					return value;
			
			}
		
		}
	
	},
	
	cleanBool: function cleanBool(value, defaultValue, format) {
	
		if ('undefined' === typeof defaultValue) {
		
			defaultValue = false;
		
		}
		else if (defaultValue && defaultValue !== 'false' && defaultValue !== '0') {
		
			defaultValue = true;
		
		}
		if ('undefined' === typeof value || null === value || '' === value || ('string' !== typeof value && value.toString() === "NaN")) {
		
			value = defaultValue;
		
		}
		value = (value && value !== 'false' && value !== '0') ? true : false;
		if ('string' !== typeof format) {
		
			return value;
		
		}
		else {
		
			switch (format) {
			
				case 'db':
					return (value) ? 1 : 0;
				case 'csv':
					return ('string' !== typeof value) ? value.toString() : value;
					break;
				default:
					return value;
			
			}
		
		}
	
	},
	
	cleanDate: function cleanDate(value, format) {
	
		var defaultValue = new Date();
		value = 'string' === typeof value || 'number' === typeof value ? new Date(value) : value;
		value = ('object' === typeof value && value instanceof Date) ? value : defaultValue;
		value = value.toString() === 'Invalid Date' ? defaultValue : value;
		if ('string' !== typeof format) {
		
			return value;
		
		}
		else {
		
			switch (format) {
			
				case 'db':
					return value.toMySqlString();
					break;
				case 'csv':
					return value.toCsvString();
					break;
				default:
					return value;
			
			}
		
		}
	
	},
	
	arrayOfObjectsOrEmpty: function arrayOfObjectsOrEmpty(value) {

		value = 'object' === typeof value && null !== value && Array.isArray(value) && 'object' === typeof value[0] ? value : [];
		var objectArray = [];
		for (let i = 0; i < value.length; i++) {
		
			objectArray[i] = 'object' === typeof value[i] ? value[i] : null;
		
		}
		return objectArray;
		
	},
	
	arrayOfStringsOrEmpty: function arrayOfStringsOrEmpty(value, discardEmpty) {

		discardEmpty = ('boolean' !== typeof discardEmpty || false === discardEmpty) ? false : true;
		value = 'object' === typeof value && null !== value && Array.isArray(value) ? value : [];
		var stringArray = [];
		var discardIndices = [];
		for (let i = 0; i < value.length; i++) {
		
			stringArray[i] = 'string' === typeof value[i] ? value[i].trim() : '';
			if ('' === stringArray[i] && discardEmpty) {
			
				discardIndices.unshift(i);
			
			}
		
		}
		if (discardEmpty && discardIndices.length > 0) {
		
			for (let j = 0; j < discardIndices.length; j++) {
			
				stringArray.splice(discardIndices[j], 1);
			
			}
		
		}
		return stringArray;
		
	}

};
