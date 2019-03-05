'use strict';

class UwotCliOperations {

	constructor() {}
	
	performOperation(operationName, operationArgs) {
	
		if (-1 !== uwotOperations.indexOf(operationName.trim())) {
			if('object' !== typeof operationArgs || !Array.isArray(operationArgs)) {
				this[operationName.trim()]();
			}
			else {
				this[operationName.trim()](operationArgs);
			}
		}
	
	}
	
	clear() {
		jQuery('#uwotoutput .output-container').html('');
	}
	
	history() {
		if ('undefined' === uwotHistory || !(uwotHistory instanceof CliHistory)) {
			uwotHistory = new CliHistory();
		}
		var histArray = uwotHistory.getAllItems();
		var histString = '<pre>';
		var maxDigits = countIntDigits(histArray.length);
		for (let i = 0; i < histArray.length; i++) {
			let digitsOff = maxDigits - countIntDigits(i);
			let histLine = '  ';
			for (let j = 0; j < digitsOff; j++) {
				histLine += ' ';
			}
			histLine += i + '  ' + histArray[i];
			histString += histLine + "\n\r";
		}
		histString += '</pre>';
		outputToMain(histString);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
	}
	
	echo(args) {
		if ('string' === typeof args) {
			outputToMain(args);
		}
		else if ('object' === typeof args && null !== args) {
			var os = '';
			if (Array.isArray(args)) {
				args.forEach(function(arg) {
					os += arg.toString() + ' ';
				});
				outputToMain(os);
			}
			else {
				var argList = Object.keys(args);
				argList.forEach(function(argName) {
					os += args[argName].toString() + ' ';
				});
				outputToMain(os);
			}
		}
		else {
			outputToMain('');
		}
	}
	
	login(args) {
		if ('object' === typeof args && Array.isArray(args) && args.length > 0) {
			if('string' === typeof args[0] && '' !== args[0]) {
				if('string' === typeof args[1] && '' !== args[1]) {
					jQuery('#uwotcli-doLogin').val('false');
					jQuery("#uwotcli-login").val('');
					jQuery('#uwotcli-input').attr('type', 'text');
					var nonce = $('#uwotcli-nonce').val();
					jQuery('#uwotheader-indicator').addClass('loading');
					$('#cliform > .field').addClass('disabled');
					$('#uwotcli-input').prop('disabled', true);
					$.post(
						'/login',
						{
							username: args[0],
							password: args[1],
							nonce,
							cwd: localStorage.getItem('UwotCwd')
						}
					)
					.done(function(data) {
						if (data.error) {
							outputToMain(data.error);
							jQuery('#uwotcli-doLogin').val('true');
							changePrompt('login');
						}
						else {
							outputToMain('Successful login for user: ' + data.user.uName);
							user = data.user.uName;
							changePrompt(user);
							if('string' === typeof data.cwd){
								changeCwd(data.cwd);
							}
						}
					})
					.fail(function(obj, status, error) {
						if ('' === error) {
							error = 'Command failed - Server temporarily unavailable';
						}
						outputToMain(error);
						jQuery('#uwotcli-doLogin').val('true');
						jQuery("#uwotcli-login").val('');
						changePrompt('login');
					}).always(function() {
						jQuery('#uwotheader-indicator').removeClass('loading');
						$('#cliform > .field').removeClass('disabled');
						$('#uwotcli-input').prop('disabled', false);
						$("#uwotcli-input").focus();
					});
				}
				else {
					jQuery('#uwotcli-doLogin').val('true');
					jQuery("#uwotcli-login").val(args[0]);
					jQuery('#uwotcli-input').attr('type', 'password');
					changePrompt('Password');
				}
			}
			else {
				jQuery('#uwotcli-doLogin').val('true');
				jQuery('#uwotcli-input').attr('type', 'text');
				changePrompt('login');
			}
		}
		else {
			jQuery('#uwotcli-doLogin').val('true');
			jQuery('#uwotcli-input').attr('type', 'text');
			changePrompt('login');
		}
	}
	
	logout() {
		var nonce = $('#uwotcli-nonce').val();
		$.post(
			'/logout',
			{
				nonce,
				cwd: localStorage.getItem('UwotCwd')
			}
		)
		.done(function(data) {
			if (data.error) {
				outputToMain(data.error);
			}
			else {
				outputToMain('Successfully logged out session for user: ' + data.user.uName);
				user = 'uwot';
				changePrompt(user);
			}
		})
		.fail(function(obj, status, error) {
			outputToMain(error);
		});
	}
	
	exit() {
		return this.logout();
	}
	
}
