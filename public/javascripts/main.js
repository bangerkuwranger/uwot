'use strict';
var uwotHistory, uwotInteractive = false;
jQuery(document).ready(function($) {

	uwotHistory = new CliHistory();
	
	changePrompt(user);
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
			outputToMain(error);
		});
	});

	$("#uwotcli-input").keydown(function(e) {
		switch(e.which) {
			case 9: // tab
				e.preventDefault();
				outputToMain('You probably wish autocomplete was implemented, don\'t you?');
				return false;
				break;
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
	
	$('#uwotterminal').click(function() {
	
		if (!uwotInteractive) {
		
			$("#uwotcli-input").focus();
		
		}
	
	})

});

function outputToMain(data) {
	if ('string' == typeof data) {
		jQuery('#uwotoutput .output-container').append('<div class="outputline">'+ data +'</div>');
	}
	if ('object' == typeof data && null !== data) {
		if ('string' == typeof data.output && '' !== data.output) {
			jQuery('#uwotoutput .output-container').append('<div class="outputline">'+ data.output +'</div>');
		}
		if ('undefined' !== typeof data.operations && 'object' == typeof uwotOperations && Array.isArray(uwotOperations)) {
			performOperations(data.operations);
		}
	}
// 	return;
	//yucky bugs make yuckier things yucky
	return jQuery('#uwotoutput .output-container').scrollTop(1E10);
}

function countIntDigits(num) {
	return num.toString().length;
}

function changePrompt(promptString) {
	jQuery('#cliform .field').attr('data-prompt', promptString + ' ');
	jQuery('#uwotcli-input').css('margin-left', (parseInt(jQuery('#cliform .field').attr('data-prompt').length) + 2) + 'ch');
	return;
}

function performOperations(operations) {
	let ops = new UwotCliOperations();
	if ('string' == typeof operations && -1 != uwotOperations.indexOf(operations.trim())) {
		ops.performOperation(operations.trim());
	}
	if ('object' == typeof operations && null !== operations) {
		if (Array.isArray(operations)) {
			operations.forEach(function(operation) {
				performOperations(operation);
			});
		}
		else if ('string' == typeof operations.name && 'object' == typeof operations.args && Array.isArray(operations.args)) {
			var args = (operations.args.length > 0) ? operations.args.map(x => x.text) : [];
			ops.performOperation(operations.name, args);
		}
	}
}
