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
		var doLogin = 'string' == typeof $("#uwotcli-doLogin").val() && 'true' === $("#uwotcli-doLogin").val();
		var hasLoginUser = 'string' == typeof $("#uwotcli-login").val() && '' !== $("#uwotcli-login").val();
		if (doLogin) {
			if (hasLoginUser) {
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
		$('#uwotheader-indicator').addClass('loading');
		$('#cliform > .field').addClass('disabled');
		$('#uwotcli-input').prop('disabled', true);
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
		})
		.always(function() {
			if (!hasLoginUser) {
				$('#uwotheader-indicator').removeClass('loading');
				$('#cliform > .field').removeClass('disabled');
				$('#uwotcli-input').prop('disabled', false);
				$("#uwotcli-input").focus();
			}
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
		if ('object' == typeof data.cookies && null !== data.cookies) {
		
			var cNames = Object.keys(data.cookies);
			for (let i =0; i < cNames.length; i++) {
				var thisCName = cNames[i];
				var thisCookie = data.cookies[thisCName];
				var curVal = uwotGetCookieValue(thisCName);
				if ('object' == typeof thisCookie && null !== thisCookie && 'string' == typeof thisCookie.value) {
					var thisValue = thisCookie.value;
					var expiry = null;
					if ('string' == typeof thisCookie.expiry) {
						expiry = new Date(thisCookie.expiry);
					}
					else if ('object' == typeof thisCookie.expiry && thisCookie.expiry instanceof Date) {
						expiry = thisCookie.expiry;
					}
					if (thisValue == '' && null !== expiry) {
						uwotSetCookie(thisCName, curVal, expiry);
					}
					else if (thisValue !== '' && null !== expiry) {
						uwotSetCookie(thisCName, thisValue, expiry);
					}
					else if (thisValue !== '') {
						uwotSetCookie(thisCName, thisValue);
					}
				}
			}
		}
		if ('object' == typeof data.redirect && data.redirect !== null) {
			jQuery('#uwotheader-indicator').addClass('loading');
			window.setTimeout(uwotClientRedirect(data.redirect), 250);
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

function uwotGetCookieValue(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function uwotSetCookie(cname, cvalue, cexpiry) {
	var expires = cexpiry instanceof Date ? "expires="+cexpiry.toUTCString() : null;
	var cstring = cname + "=" + cvalue + ";";
	if (null !== expires) {
		cstring += expires + ";path=/";
	}
	else {
		cstring += ";path=/";
	}
	document.cookie = cstring;
}

function uwotClientRedirect(redirect) {
	if ('object' == typeof redirect && null !== redirect) {
		return window.location.replace(redirect.path);
	}
}
