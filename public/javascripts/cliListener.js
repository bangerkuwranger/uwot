'use strict';
if ('object' !== typeof validUwotListenerTypes || !(Array.isArray(validUwotListenerTypes))) {

	var validUwotListenerTypes = [
		'default',
		'additional',
		'exclusive'
	];

}
const defaultUwotListenerOptions = {
	type:		'additional'
};

// class to listen to input from CLI

class UwotCliListener {

	constructor(name, options) {
	
		if ('string' !== typeof name) {
		
			throw new TypeError('invalid name passed to UwotCliListener contstructor');
		
		}
		else {
		
			if ('object' === typeof options && null !== options) {
			
				this.type = 'string' === typeof options.type && -1 !== validUwotListenerTypes.indexOf(options.type) ? options.type : defaultUwotListenerOptions.type;
			
			}
		
		}
	
	}

}

