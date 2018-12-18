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
		outputToMain('echo' + args);
	}
	
	login(args) {
		
	}
	
	logout() {
	
	}
	
}
