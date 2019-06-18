'use strict';
const VALID_TYPES = [
	'UNKNOWN',
	'NOISID',
	'NOLNAME',
	'NONONCE',
	'NONCEINV',
	'CMDINV',
	'APPINV',
	'NOTEXCL'
];
const TYPE_REASONS = new Map(
	[
		[VALID_TYPES[0], 'unknown'],
		[VALID_TYPES[1], 'ISID not found'],
		[VALID_TYPES[2], 'Listener Name not found'],
		[VALID_TYPES[3], 'Nonce not found'],
		[VALID_TYPES[4], 'Nonce value invalid'],
		[VALID_TYPES[5], 'Cmd value invalid'],
		[VALID_TYPES[6], 'App value invalid'],
		[VALID_TYPES[7], 'Specified listener not exclusive'],
	]
);

class UwotListenerError extends Error {

	constructor(msg, context) {
		
		var message = 'Access Denied';
		var unknownContext = {
			type: 'UNKNOWN',
			reason: 'unknown',
			isid: 'unknown',
			lname: 'unknown'
		};
		if ('object' !== typeof context || null === context) {
		
			context = unknownContext;
		
		}
		else {
		
			if ('string' !== typeof context.type || -1 === VALID_TYPES.indexOf(context.type)) {
			
				context.type = unknownContext.type;
			
			}
			if ('string' !== typeof context.reason) {
			
				context.reason = TYPE_REASONS.get(context.type);
			
			}
		
		}
		if ('string' === typeof context.type && context.type !== unknownContext.type) {
		
			message += ' - ' + context.type;
		
		}
		if ('string' === typeof msg && '' !== msg) {
		
			message += ': ' + msg;

		}
		else {
		
			message += ': ' + context.reason;
		
		}
		message += '. ';
		if ('string' === typeof context.isid) {
		
			message += `${context.isid.toString()}`;
		
		}
		if ('string' === typeof context.lname) {
		
			message += `[${context.lname.toString()}]`;
		
		}
		super(message);
		Object.defineProperty(this, 'kInfo', {
			configurable: false,
			enumerable: false,
			value: context,
			writable: true
		});
		Object.defineProperty(this, 'kCode', {
			configurable: false,
			enumerable: false,
			value: context.type,
			writable: true
		});
		Object.defineProperty(this, 'type', {
			enumerable: true,
			get() {

				return this.kCode;

			},
			set(value) {

				this.kCode = value;

			}
		});
		Object.defineProperty(this, 'isid', {
			enumerable: true,
			get() {
	
				return 'object' !== typeof this.kInfo || 'undefined' === typeof this.kInfo.isid ? undefined : this.kInfo.isid.toString();
	
			},
			set(val) {
	
				this.kInfo.isid = 'string' === typeof val ? val.toString() : undefined;
	
			}
		});
		Object.defineProperty(this, 'lname', {
			enumerable: true,
			get() {
	
				return 'object' !== typeof this.kInfo || typeof this.kInfo.lname === 'undefined' ? undefined : this.kInfo.lname.toString();
	
			},
			set(val) {
	
				this.kInfo.lname = 'string' === typeof val ? val.toString() : undefined;
	
			}
		});
		Object.defineProperty(this, 'reason', {
			enumerable: true,
			get() {
	
				return this.kInfo.reason;
	
			},
			set(val) {
	
				this.kInfo.reason = val;
	
			}
		});
		// Object.defineProperty(this, 'stack', {
//			enumerable: true,
//			value: 
		Error.captureStackTrace(this, UwotListenerError);
//		});
		
  }

	get name() {

		return 'Error';
	
	}

	set name(value) {
	
		Object.defineProperty(this, 'name', {
			configurable: true,
			enumerable: true,
			value,
			writable: true
		});
	
	}

	get info() {
	
		return this['kInfo'];
	
	}

}

module.exports = UwotListenerError;
