'use strict';

class UwotCliOperations {

	constructor() {}
	
	performOperation(operationName, operationArgs) {
	
		if (-1 != uwotOperations.indexOf(operationName.trim())) {
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
		if ('undefined' == uwotHistory || !(uwotHistory instanceof CliHistory)) {
			uwotHistory = new CliHistory();
		}
		var histArray = uwotHistory.getAllItems();
		var maxDigits = countIntDigits(histArray.length);
		for (let i = 0; i < histArray.length; i++) {
			let digitsOff = maxDigits - countIntDigits(i);
			let histLine = '  ';
			for (let j = 0; j < digitsOff; j++) {
				histLine += ' ';
			}
			histLine += i + '  ' + histArray[i];
			outputToMain(histLine);
		}
	}
	
	echo(args) {
		if ('string' == typeof args) {
			outputToMain(args);
		}
		else if ('object' == typeof args && null !== args) {
			if (Array.isArray(args)) {
				var os = '';
				args.forEach(function(arg) {
					os += arg.toString() + ' ';
				});
				outputToMain(os);
			}
			else {
				var argList = Object.keys(args);
				var os = '';
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
		if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
			if('string' == typeof args[0] && '' !== args[0]) {
				if('string' == typeof args[1] && '' !== args[1]) {
					jQuery('#uwotcli-doLogin').val('false');
					jQuery("#uwotcli-login").val('');
					var nonce = $('#uwotcli-nonce').val();
					$.post(
						'/login',
						{
							username: args[0],
							password: args[1],
							nonce: nonce
						}
					)
					.done(function(data) {
						if (data.error) {
							outputToMain(data.error.message);
							jQuery('#uwotcli-doLogin').val('true');
							jQuery("#uwotcli-login").val('');
							changePrompt('login');
						}
						else {
							outputToMain('Successful login for user: ' + data.user.uName);
							user = data.user.uName;
							changePrompt(user);
						}
					})
					.fail(function(obj, status, error) {
						outputToMain(error);
						jQuery('#uwotcli-doLogin').val('true');
						jQuery("#uwotcli-login").val('');
						changePrompt('login');
					});
				}
				else {
					jQuery('#uwotcli-doLogin').val('true');
					$("#uwotcli-login").val(args[0]);
					changePrompt('Password');
				}
			}
			else {
				jQuery('#uwotcli-doLogin').val('true');
				changePrompt('login');
			}
		}
		else {
			jQuery('#uwotcli-doLogin').val('true');
			changePrompt('login');
		}
	}
	
	logout() {
	
	}
	
	exit() {
	
	}
	
}
