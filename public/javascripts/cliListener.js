'use strict';

const defaultUwotListenerOptions = {
	type:		'default',
	path:		'/bin',
	cmdSet:		[]
};

// class to listen to input from CLI

class UwotCliListener {

	constructor(name, options, status) {
	
		if ('string' !== typeof name) {
		
			throw new TypeError('invalid name passed to UwotCliListener contstructor');
		
		}
		else {
		
			if ('object' !== typeof options && null !== options) {
			
				options = Object.assign({}, defaultUwotListenerOptions);
			
			}
			this.name = name.trim();
			this.status = 'string' === typeof status && 'enabled' === status ? 'enabled' : 'disabled';
			this.type = 'string' === typeof options.type && -1 !== validUwotListenerTypes.indexOf(options.type) ? options.type : defaultUwotListenerOptions.type;
			this.path = 'string' === typeof options.path ? '/listeners/' + options.path : defaultUwotListenerOptions.path;
			this.cmdSet = 'object' === typeof options.cmdSet && Array.isArray(options.cmdSet) && options.cmdSet.length > 0 ? options.cmdSet : defaultUwotListenerOptions.cmdSet;
			this.isid = 'string' === typeof options.isid && '' !== options.isid ? options.isid : '';
			// TBD
			// add individual listener nonce from server
			this.history = new CliHistory(this.name);
		
		}
	
	}
	
	post(data) {
	
		if ('object' !== typeof data || 'string' !== typeof data.op || '' === data.op) {
		
			return outputToMain('', {addPrompt:true});
		
		}
		else {
		
			var doLogin = false;
			var hasLoginUser = false;
			if (this.type === 'default') {
		
				doLogin = 'string' === typeof $("#uwotcli-doLogin").val() && 'true' === $("#uwotcli-doLogin").val();
				hasLoginUser = 'string' === typeof $("#uwotcli-login").val() && '' !== $("#uwotcli-login").val();
				if (doLogin) {
					if (hasLoginUser) {
						data.op = 'login ' + $("#uwotcli-login").val() + ' ' + data.op;
					}
					else {
						data.op = 'login ' + data.op;
					}
				}
				else {
			
					this.history.addItem(data.op);
			
				}
		
			}
			else {
		
				this.history.addItem(data.op);
		
			}
			jQuery.post(
				this.path,
				data
			)
			.done(function(result) {
				outputToMain(result);
			})
			.fail(function(obj, status, error) {
				if ('' === error) {
					error = 'Command failed - Server temporarily unavailable';
				}
				outputToMain(error);
			})
			.always(function() {
				if (!hasLoginUser) {
					uwotInterface.enableInput();
				}
			});
		
		}
	
	}
	
	enable() {
	
		
	
	}
	
	disable() {
	
		
	
	}

}

