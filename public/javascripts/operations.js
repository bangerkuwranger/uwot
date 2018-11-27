'use strict';
const uwotCliValidOps = [
	"clear",
	"history"
];

class UwotCliOperations {

	constructor() {}
	
	performOperation(operationName) {
	
		if (-1 != uwotCliValidOps.indexOf(operationName.trim())) {
			this[operationName.trim()]();
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

}
