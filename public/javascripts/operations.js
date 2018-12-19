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
		jQuery('#uwotoutput').html('');
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
		
	}
	
	logout() {
	
	}
	
	exit() {
	
	}
	
}
