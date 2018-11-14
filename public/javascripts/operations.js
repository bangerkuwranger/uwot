'use strict';
const wotCliValidOps = [
	"clear",
	"history"
];

class WotCliOperations {

	constructor() {}
	
	performOperation(operationName) {
	
		if (-1 != wotCliValidOps.indexOf(operationName.trim())) {
			this[operationName.trim()]();
		}
	
	}
	
	clear() {
		jQuery('#wotoutput').html('');
	}
	
	history() {
		if ('undefined' == wotHistory || !(wotHistory instanceof CliHistory)) {
			wotHistory = new CliHistory();
		}
		var histArray = wotHistory.getAllItems();
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
