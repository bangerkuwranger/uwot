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
			this.type = 'string' === typeof options.type && -1 !== uwotListenerTypes.indexOf(options.type) ? options.type : defaultUwotListenerOptions.type;
			this.cmdSet = 'object' === typeof options.cmdSet && Array.isArray(options.cmdSet) && options.cmdSet.length > 0 ? options.cmdSet : defaultUwotListenerOptions.cmdSet;
			this.isid = 'string' === typeof options.isid && '' !== options.isid ? options.isid : '';
			this.nonce = 'string' === typeof options.nonce && '' !== options.nonce ? options.nonce : null;
			this.path = 'string' === typeof options.path ? options.path + '/' + this.isid + '/' + this.name : defaultUwotListenerOptions.path;
			this.history = new CliHistory(this.name);
		
		}
	
	}
	
	post(data) {
	
		if ('object' !== typeof data || 'string' !== typeof data.cmd || '' === data.cmd) {
		
			uwotInterface.enableInput();
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
						data.cmd = 'login ' + $("#uwotcli-login").val() + ' ' + data.cmd;
					}
					else {
						data.cmd = 'login ' + data.cmd;
					}
				}
				else {
			
					this.history.addItem(data.cmd);
			
				}
		
			}
			else {
		
				this.history.addItem(data.cmd);
		
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
	
		this.status = 'enabled';
	
	}
	
	disable() {
	
		this.status = 'disabled';
	
	}

}

