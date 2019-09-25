'use strict';
/* global jQuery, uwotInterface, uwotListenerTypes, CliHistory, outputToMain */

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
				beforePost: [],
				afterPostFail: [],
				afterPostSuccess: [],
				afterPostAlways: []
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
			var self = this;
			self.callHook('beforePost', data)
			.then((bphData) => {
				jQuery.post(
					self.path,
					bphData
				)
				.done((result) => {
					self.callHook('afterPostSuccess', result)
					.then((apshResult) => {
						outputToMain(apshResult);
					})
					.catch((e) => {
						console.error(e);
						outputToMain(result);
					});
				})
				.fail((obj, status, error) => {
					var result = {
						obj,
						status,
						error
					};
					self.callHook('afterPostFail', result)
					.then((apfhResult) => {
						if ('' === apfhResult.error) {
							apfhResult.error = 'Command failed - Server temporarily unavailable';
						}
						outputToMain(apfhResult.error);
					})
					.catch((e) => {
						console.error(e);
						if ('' === result.error) {
							result.error = 'Command failed - Server temporarily unavailable';
						}
						outputToMain(result.error);
					});
				})
				.always(function(dataOrXhrObj, status, xhrObjOrError) {
					var result = {
						dataOrXhrObj,
						status,
						xhrObjOrError
					};
					self.callHook('afterPostAlways', result)
					.then((apahResult) => {
						if (!hasLoginUser) {
							uwotInterface.enableInput();
						}
					})
					.catch((e) => {
						console.error(e);
						if (!hasLoginUser) {
							uwotInterface.enableInput();
						}
			
					});
				});
			})
			.catch((e) => {
				console.error(e);
				jQuery.post(
					self.path,
					data
				)
				.done((result) => {
					self.callHook('afterPostSuccess', result)
					.then((apshResult) => {
						outputToMain(apshResult);
					})
					.catch((e) => {
						console.error(e);
						outputToMain(result);
					});
				})
				.fail((obj, status, error) => {
					var result = {
						obj,
						status,
						error
					};
					self.callHook('afterPostFail', result)
					.then((apfhResult) => {
						if ('' === apfhResult.error) {
							apfhResult.error = 'Command failed - Server temporarily unavailable';
						}
						outputToMain(apfhResult.error);
					})
					.catch((e) => {
						console.error(e);
						if ('' === result.error) {
							result.error = 'Command failed - Server temporarily unavailable';
						}
						outputToMain(result.error);
					});
				})
				.always(function(dataOrXhrObj, status, xhrObjOrError) {
					var result = {
						dataOrXhrObj,
						status,
						xhrObjOrError
					};
					self.callHook('afterPostAlways', result)
					.then((apahResult) => {
						if (!hasLoginUser) {
							uwotInterface.enableInput();
						}
					})
					.catch((e) => {
						console.error(e);
						if (!hasLoginUser) {
							uwotInterface.enableInput();
						}
			
					});
				});
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
	
	// Returns a promise that is always resolved
	// Calls all hook functions in this.hooks[hookName] array,
	// passing resulting data arg to the next hook in sequence, and returning
	// resulting data in resolved promise
	// upon error, returns unaltered data value
	callHook(hookName, data) {
		return new Promise((resolve) => {
			var hookNames = Object.keys(this.hooks);
			if ('string' !== typeof hookName || -1 === hookNames.indexOf(hookName)) {
				console.error(new Error('invalid hook name passed to UwotCliListener.callHook'));
				return resolve(data);
			}
			else if (this.hooks[hookName].length < 1) {
				return resolve(data);
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
						return resolve(data);
					}
				});
			}
		});
	}
}

