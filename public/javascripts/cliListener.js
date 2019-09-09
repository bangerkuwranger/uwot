'use strict';

const defaultUwotListenerOptions = {
	type:		'additional',
	path:		'/listeners',
	cmdSet:		[]
};

// class to listen to input from CLI

class UwotCliListener {

	constructor(name, options, status) {
	
		if ('string' !== typeof name) {
		
			throw new TypeError('invalid name passed to UwotCliListener contstructor');
		
		}
		else {
		
			if ('object' === typeof options && null !== options) {
			
				this.type = 'string' === typeof options.type && -1 !== validUwotListenerTypes.indexOf(options.type) ? options.type : defaultUwotListenerOptions.type;
				this.path = 'string' === typeof options.path ? '/listeners/' + options.path : defaultUwotListenerOptions.path;
				this.cmdSet = 'object' === typeof options.cmdSet && Array.isArray(options.cmdSet) && options.cmdSet.length > 0 ? options.cmdSet : defaultUwotListenerOptions.cmdSet;
				this.isid = 'string' === typeof options.isid && '' !== options.isid ? options.isid : '';
			
			}
			this.status = 'string' === typeof status && 'enabled' === status ? 'enabled' : 'disabled';
		
		}
	
	}
	
	post(data) {
	
		if ('object' !== typeof data || 'string' !== typeof data.op || '' === data.op) {
		
			return outputToMain('', {addPrompt:true});
		
		}
		var doLogin = false;
		var hasLoginUser = false;
		if (this.type === 'default') {
		
			doLogin = 'string' === typeof $("#uwotcli-doLogin").val() && 'true' === $("#uwotcli-doLogin").val();
			hasLoginUser = 'string' === typeof $("#uwotcli-login").val() && '' !== $("#uwotcli-login").val();
			if (doLogin) {
				if (hasLoginUser) {
					op = 'login ' + $("#uwotcli-login").val() + ' ' + data.op;
				}
				else {
					op = 'login ' + data.op;
				}
			}
		
		}
		else {
		
		
		
		}
	
	}
	
	enable() {
	
		
	
	}
	
	disable() {
	
		
	
	}

}

