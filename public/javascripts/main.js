'use strict';
var wotHistory;
jQuery(document).ready(function($) {

	wotHistory = new CliHistory();
	
	$("#wotcli-input").focus();
	
	$("#wotcli").submit(function(e) {
		e.preventDefault();
		var op = $('#wotcli-input').val();
		wotHistory.addItem(op);
		outputToMain(op);
		$("#wotcli-input").val('').focus();
		var nonce = $('#wotcli-nonce').val();
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

	$("#wotcli-input").keyup(function(e) {
		switch(e.which) {
			case 38: // up
				e.preventDefault();
				var prevCmd = wotHistory.getPrevItem();
				$("#wotcli-input").val(prevCmd).focus();
				break;

			case 40: // down
				e.preventDefault();
				var nextCmd = wotHistory.getNextItem();
				$("#wotcli-input").val(nextCmd).focus();
				break;

			default: return; // exit this handler for other keys
		}
	});	

});

function outputToMain(data) {
	if ('string' == typeof data) {
		jQuery('#wotoutput').append('<div class="outputline"><pre>'+ data +'</pre></div>');
	}
	if ('object' == typeof data && null !== data) {
		if ('string' == typeof data.output && '' !== data.output) {
			jQuery('#wotoutput').append('<div class="outputline"><pre>'+ data.output +'</pre></div>');
		}
		if ('string' == typeof data.operation && 'object' == typeof wotCliValidOps && Array.isArray(wotCliValidOps) && -1 != wotCliValidOps.indexOf(data.operation.trim())) {
			let ops = new WotCliOperations();
			ops.performOperation(data.operation.trim());
		}
	}
	return;
}

function countIntDigits(num) {
	return num.toString().length;
}
