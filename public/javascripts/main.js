'use strict';
var uwotHistory;
jQuery(document).ready(function($) {

	uwotHistory = new CliHistory();
	
	$("#uwotcli-input").focus();
	
	$("#uwotcli").submit(function(e) {
		e.preventDefault();
		var op = $('#uwotcli-input').val();
		uwotHistory.addItem(op);
		outputToMain(op);
		$("#uwotcli-input").val('').focus();
		var nonce = $('#uwotcli-nonce').val();
		$.post(
			'/bin',
			{
				cmd: op,
				nonce: nonce
			}
		)
		.done(function(data) {
			outputToMain(data);
		})
		.fail(function(obj, status, error) {
			outputToMain(status);
		});
	});

	$("#uwotcli-input").keyup(function(e) {
		switch(e.which) {
			case 38: // up
				e.preventDefault();
				var prevCmd = uwotHistory.getPrevItem();
				$("#uwotcli-input").val(prevCmd).focus();
				break;

			case 40: // down
				e.preventDefault();
				var nextCmd = uwotHistory.getNextItem();
				$("#uwotcli-input").val(nextCmd).focus();
				break;

			default: return; // exit this handler for other keys
		}
	});	

});

function outputToMain(data) {
	if ('string' == typeof data) {
		jQuery('#uwotoutput').append('<div class="outputline"><pre>'+ data +'</pre></div>');
	}
	if ('object' == typeof data && null !== data) {
		if ('string' == typeof data.output && '' !== data.output) {
			jQuery('#uwotoutput').append('<div class="outputline"><pre>'+ data.output +'</pre></div>');
		}
		if ('string' == typeof data.operation && 'object' == typeof uwotCliValidOps && Array.isArray(uwotCliValidOps) && -1 != uwotCliValidOps.indexOf(data.operation.trim())) {
			let ops = new UwotCliOperations();
			ops.performOperation(data.operation.trim());
		}
	}
	return;
}

function countIntDigits(num) {
	return num.toString().length;
}
