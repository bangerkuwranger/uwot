require('./dateMethods');
require('./stringMethods');
// require('./arrayMethods');
module.exports = {

	stringNoSpaces: function stringNoSpaces(value, format) {
	
		if ('string' !== typeof value) {
		
			value = value.toString().trim();
		
		}
		else {
		
			value = value.trim();
		
		}
		value = value.split(' ').join('_');
		if ('string' !== typeof format) {
		
			format = 'cc';
		
		}
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
					
						value = ('string' == typeof value) ? parseInt(value) : value;
						return (Number.isInteger(value)) ? value : defaultValue;
					
					}
					break;
				case 'csv':
					if (null === value) {
					
						return '';
					
					}
					else {
					
						value = ('number' == typeof value) ? value.toString() : value;
						return (defaultValue === value || defaultValue.toString() === value) ? null: value;
					
					}
					break;
				default:
					return value;
			
			}
		
		}
	
	},
	
	cleanFloat: function cleanFloat(value, defaultValue, format) {
	
		if ('number' !== defaultValue) {
		
			defaultValue = 0.0000;
		
		}
		var valueFloat = ('number' === typeof value && !(isNaN(parseFloat(value)))) ? parseFloat(value) : defaultValue;
		value = (isNaN(valueFloat)) ? defaultValue : parseFloat(valueFloat.toFixed(4));
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
					
						return ('string' == typeof value) ? parseFloat(value) : value;
					
					}
					break;
				case 'csv':
					if (null === value) {
					
						return '';
					
					}
					else {
					
						value = ('number' == typeof value) ? value.toFixed(4) : value.toString();
						return (defaultValue === value || defaultValue.toFixed(4) === value) ? null: value;
					
					}
					break;
				default:
					return value;
			
			}
		
		}
	
	},
	
	cleanBool: function cleanBool(value, defaultValue, format) {
	
		if ('undefined' === defaultValue) {
		
			defaultValue = false;
		
		}
		else if (defaultValue && defaultValue !== 'false' && defaultValue !== '0') {
		
			defaultValue = true;
		
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
	
		value = 'string' == typeof value ? new Date(value) : value;
		value = ('object' == typeof value && value instanceof Date) ? value : new Date();
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

		value = 'object' == typeof value && null !== value && Array.isArray(value) && 'object' == typeof value[0] ? value : [];
		var objectArray = [];
		for (let i = 0; i < value.length; i++) {
		
			objectArray[i] = 'object' === typeof value[i] ? value[i] : null;
		
		}
		return objectArray;
		
	},
	
	arrayOfStringsOrEmpty: function arrayOfStringsOrEmpty(value) {

		value = 'object' == typeof value && null !== value && Array.isArray(value) && 'string' == typeof value[0] ? value : [];
		var stringArray = [];
		for (let i = 0; i < value.length; i++) {
		
			stringArray[i] = 'string' === typeof value[i] ? value[i].trim() : '';
		
		}
		return stringArray;
		
	}

};
