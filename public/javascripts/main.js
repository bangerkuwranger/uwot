'use strict';
var uwotHistory, uwotInteractive = false;
jQuery(document).ready(function($) {

	uwotHistory = new CliHistory();
	
	if ('string' == typeof $("#uwotcli-doLogin").val() && 'true' === $("#uwotcli-doLogin").val()) {
		changePrompt('login')
	}
	else {
		changePrompt(user);
	}
	$("#uwotcli-input").focus();
	
	$("#uwotcli").submit(function(e) {
		e.preventDefault();
		var op;
		if ('string' == typeof $("#uwotcli-doLogin").val() && 'true' === $("#uwotcli-doLogin").val()) {
			if ('string' == typeof $("#uwotcli-login").val() && '' !== $("#uwotcli-login").val()) {
				op = 'login ' + $("#uwotcli-login").val() + ' ' + $('#uwotcli-input').val();
			}
			else {
				op = 'login ' + $('#uwotcli-input').val();
			}
		}
		else {
			op = $('#uwotcli-input').val();
			uwotHistory.addItem(op);
			outputToMain(op, {addPrompt:true});
		}
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

function outputToMain(data, args) {
	var lineClasses = "outputline";
	if ('object' == typeof args) {
		if ('boolean' == typeof args.addPrompt && args.addPrompt) {
			lineClasses += " add-prompt";
		}
	}
	if ('string' == typeof data) {
		jQuery('#uwotoutput .output-container').append('<div class="' + lineClasses + '">'+ data +'</div>');
	}
	if ('object' == typeof data && null !== data) {
		if ('string' == typeof data.output && '' !== data.output) {
			jQuery('#uwotoutput .output-container').append('<div class="' + lineClasses + '">'+ data.output +'</div>');
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
	var prevPrompt = jQuery('#cliform .field').attr('data-prompt').trim();
	jQuery('#cliform .field').attr('data-prompt', promptString + ' ');
	jQuery('#cliform .field').attr('data-prev-prompt', prevPrompt);
	jQuery('#uwotcli-input').css('margin-left', (parseInt(jQuery('#cliform .field').attr('data-prompt').length) + 2) + 'ch');
	return;
}

function revertPrompt() {
	var promptString = 'string' == typeof jQuery('#cliform .field').attr('data-prev-prompt') && '' !== jQuery('#cliform .field').attr('data-prev-prompt') ? jQuery('#cliform .field').attr('data-prev-prompt') : user;
	var prevPrompt = jQuery('#cliform .field').attr('data-prompt').trim();
	jQuery('#cliform .field').attr('data-prompt', promptString + ' ');
	jQuery('#cliform .field').attr('data-prev-prompt', prevPrompt);
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
