'use strict';
/* global jQuery, uwotInterface, uwotListenerTypes, CliHistory */

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
			this.hooks = {
				before_post: [],
				after_post_fail: [],
				after_post_success: [],
				after_post_always: []
			};
		
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
			data = this.callHook('before_post', data);
			var self = this;
			jQuery.post(
				this.path,
				data
			)
			.done(function(result) {
				result = self.callHook('after_post_success', result);
				outputToMain(result);
			})
			.fail(function(obj, status, error) {
				var result = {
					obj,
					status,
					error
				};
				result = self.callHook('after_post_fail', result);
				if ('' === result.error) {
					result.error = 'Command failed - Server temporarily unavailable';
				}
				outputToMain(result.error);
			})
			.always(function(dataOrXhrObj, status, xhrObjOrError) {
				var result = {
					dataOrXhrObj,
					status,
					xhrObjOrError
				};
				result = self.callHook('after_post_always', result);
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
	
	// cbFn must not be anonymous
	addHook(hookName, cbFn) {
	
		var hookNames = Object.keys(this.hooks);
		if ('string' !== typeof hookName || -1 === hookNames.indexOf(hookName)) {
		
			return console.error(new Error('invalid hook name passed to UwotCliListener.addHook'));
		
		}
		var fnNames = this.hooks[hookName].map((thisFn) => {
		
			return thisFn.name;
		
		});
		if ('function' !== typeof cbFn || -1 !== fnNames.indexOf(cbFn.name)) {
		
			console.error(new Error('invalid callback function passed to UwotCliListener.addHook'));
		
		}
		else {
		
			this.hooks[hookName].push(cbFn);
			return;
		
		}
	
	}
	
	removeHook(hookName, cbName) {
	
		var hookNames = Object.keys(this.hooks);
		if ('string' !== typeof hookName || -1 === hookNames.indexOf(hookName)) {
		
			return console.error(new Error('invalid hook name passed to UwotCliListener.removeHook'));
		
		}
		var fnNames = this.hooks[hookName].map((thisFn) => {
		
			return thisFn.name;
		
		});
		var fnIdx = fnNames.indexOf(cbName);
		if ('string' !== typeof cbName || -1 === fnIdx) {
		
			return console.error(new Error('invalid callback function name passed to UwotCliListener.removeHook'));
		
		}
		else {
		
			delete this.hooks[hookName][fnIdx];
			return;
		
		}
	
	}
	
	callHook(hookName, data) {
	
		var hookNames = Object.keys(this.hooks);
		if ('string' !== typeof hookName || -1 === hookNames.indexOf(hookName)) {
		
			console.error(new Error('invalid hook name passed to UwotCliListener.callHook'));
			return data;
		
		}
		else if (this.hooks[hookName].length < 1) {
		
			return data;
		
		}
		else {
		
			var i = 0;
			this.hooks[hookName].forEach((thisHookFn) => {
			
				try {
				
					var hookResult = thisHookFn(data);
					if (hookResult instanceof Error) {
					
						console.error(hookResult);
					
					}
					else {
					
						data = hookResult;
					
					}
				
				}
				catch(e) {
			
					console.error(e);
			
				}
				if (++i >= this.hooks[hookName].length) {
				
					return data;
				
				}
			
			});
			
		
		}
	
	}

}

