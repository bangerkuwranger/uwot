'use strict';
/* global jQuery, UwotCliListener, UwotCliOperations, UwotBrowse */

var uwotHistory, uwotIsid, uwotInteractive = false;
var initTouchSupport = false;
var uwotInterface = {};
var uwotListeners = {};
var uwotBrowseInstance = null;

function countIntDigits(num) {
	return num.toString().length;
}

function changePrompt(promptString) {
	var prevPrompt = jQuery('#cliform .field').attr('data-prompt').trim();
	jQuery('#cliform .field').attr('data-prompt', promptString + ' ');
	jQuery('#cliform .field').attr('data-prev-prompt', prevPrompt);
	jQuery('#uwotcli-input').css('margin-left', (parseInt(jQuery('#cliform .field').attr('data-prompt').length) + parseInt(jQuery('#cliform .field').attr('data-cwd').length) + 3) + 'ch');
	return;
}

function revertPrompt() {
	var promptString = 'string' === typeof jQuery('#cliform .field').attr('data-prev-prompt') && '' !== jQuery('#cliform .field').attr('data-prev-prompt') ? jQuery('#cliform .field').attr('data-prev-prompt') : user;
	var prevPrompt = jQuery('#cliform .field').attr('data-prompt').trim();
	jQuery('#cliform .field').attr('data-prompt', promptString + ' ');
	jQuery('#cliform .field').attr('data-prev-prompt', prevPrompt);
	jQuery('#uwotcli-input').css('margin-left', (parseInt(jQuery('#cliform .field').attr('data-prompt').length) + parseInt(jQuery('#cliform .field').attr('data-cwd').length) + 3) + 'ch');
	return;
}

function changeCwd(cwdString) {
		var cwdArray = cwdString.split('/');
		var cwdLast;
		var tinyCwd = false;
		if (cwdString.trim() === '/') {
			cwdLast = '/';
			tinyCwd = true;
		}
		else if (cwdArray.length < 3) {
			cwdLast = cwdString;
			tinyCwd = true;
		}
		else {
			cwdLast = cwdArray.pop();
			while (cwdLast === "") {
				cwdLast = cwdArray.pop();
			}
			cwdLast = 'undefined' === typeof cwdLast ? '/' : cwdLast;
			while (cwdArray[0] === "") {
				cwdArray.shift();
			}
			cwdString = cwdLast === '/' ? '' : '/';
			cwdString += cwdArray.join('/') + '/' + cwdLast;
		}
		jQuery('#cliform .field').attr('data-cwd', cwdLast);
		jQuery('#uwotcli-input').css('margin-left', (parseInt(jQuery('#cliform .field').attr('data-prompt').length) + parseInt(jQuery('#cliform .field').attr('data-cwd').length) + 2) + 'ch');
		var $headerCwd = jQuery('#uwotheader > h1 > .header-cwd .ellipsis-text');
		if($headerCwd.length > 0) {
			$headerCwd.text(cwdString);
			if (tinyCwd) {
				//dumb css is dumb
				$headerCwd.addClass('reverse-path');
			}
			else {
				$headerCwd.removeClass('reverse-path');
			}
			onWidth();
		}
		localStorage.setItem('UwotCwd', cwdString);
	return;
}

function performOperations(operations) {
	let ops = new UwotCliOperations();
	if ('string' === typeof operations && -1 !== uwotOperations.indexOf(operations.trim())) {
		ops.performOperation(operations.trim());
	}
	if ('object' === typeof operations && null !== operations) {
		if (Array.isArray(operations)) {
			operations.forEach(function(operation) {
				performOperations(operation);
			});
		}
		else if ('string' === typeof operations.name && 'object' === typeof operations.args && Array.isArray(operations.args)) {
			var args = [];
			if (operations.args.length > 0) {
				operations.args.forEach(function(argNode) {
					args.push(argNode.text);
				});
			}
			ops.performOperation(operations.name, args);
		}
	}
}

function uwotGetCookieValue(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
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
	if ('object' === typeof redirect && null !== redirect) {
		return window.location.replace(redirect.path);
	}
}

function onWidth() {
	
	jQuery('.header-cwd .ellipsis-text').css('width', 'auto');
	if ((jQuery('.header-cwd .ellipsis-text').prop('scrollWidth') -1 ) > jQuery('.header-cwd .ellipsis-text').width()) {
		jQuery('.header-cwd .ellipsis').show();
	}
	else {
		jQuery('.header-cwd .ellipsis').hide();
	}
	jQuery('.header-cwd').css('width', 'calc(' + (jQuery('#uwotheader > h1').width() - (jQuery('.header-title').width() + jQuery('.header-version').width() + jQuery('.header-theme').width()) + 'px - 7ch)'));
}

function updateListeners(serverListeners) {

	var oldListenerNames = Object.keys(uwotListeners);
	var newListenerNames = serverListeners.map((listenerObj) => {
	
		return listenerObj.name;
	
	});
	// remove outdated listeners for instance session
	oldListenerNames.forEach((oldName) => {
	
		if (-1 === newListenerNames.indexOf(oldName)) {
		
			delete uwotListeners[oldName];
		
		}
	
	});
	for (let i = 0; i < serverListeners.length; i++) {
	
		// create a new client listener if it hasn't been created yet
		if (-1 === oldListenerNames.indexOf(serverListeners[i].name)) {
		
			uwotListeners[serverListeners[i].name] = new UwotCliListener(
				serverListeners[i].name,
				serverListeners[i].options,
				serverListeners[i].status,
				serverListeners[i].nonce
			);
		
		}
		// otherwise, validate client values match server
		else {
		
			var thisOldListener = uwotListeners[serverListeners[i].name];
			var serverOpts = Object.keys(serverListeners[i].options);
			serverOpts.forEach((optName) => {
			
				if ('path' === optName && 'exclusive' === serverListeners[i].options.type) {
				
					thisOldListener.path = serverListeners[i].options.path + '/' + serverListeners[i].options.isid + '/' + serverListeners[i].name;
				
				}
				else {
				
					thisOldListener[optName] = serverListeners[i].options[optName];
				
				}
			
			});
			if (thisOldListener.status !== serverListeners[i].status && 'enabled' === serverListeners[i].status) {
			
				thisOldListener.enable();
			
			}
			if (thisOldListener.status !== serverListeners[i].status && 'enabled' !== serverListeners[i].status) {
			
				thisOldListener.disable();
			
			}
		
		}
		if ((i +1) >= serverListeners.length) {
					
			return uwotListeners;
		
		}
	
	}

}

function getEnabledListeners() {

	var enabledListeners = [];
	var uwotListenerNames = Object.keys(uwotListeners);
	uwotListenerNames.forEach((lname) => {
	
		if (uwotListeners[lname].status === 'enabled') {
		
			enabledListeners.push(uwotListeners[lname]);
		
		}
	
	});
	return enabledListeners;

}

function getCurrentHistory() {

	var currentHistory;
	// get enabled listeners
	var enabledListeners = getEnabledListeners();
	// if one, return that listener's history (exclusive or default only)
	if (enabledListeners.length === 1) {
	
		currentHistory =  enabledListeners[0].history;
	
	}
	// otherwise, return the default listener's history
	else {
	
		enabledListeners.forEach((elistener) => {
		
			if (elistener.type === 'default') {
			
				currentHistory = elistener.history;
			
			}
		
		});
	
	}
	return currentHistory;

}

function initListeners(isid) {

	uwotListeners = {
		'default': new UwotCliListener(
			'default',
			{
				isid,
				type:	'default',
				cmdSet: uwotOperations	// TBD // should actually have all reserved bins + ops here, but cmdSet is not used client side, for now, so nbd
			},
			'enabled'
		)
	};
	return uwotListeners;

}

function outputToMain(data, args) {
	var lineClasses = "outputline";
	if ('object' === typeof args) {
		if ('boolean' === typeof args.addPrompt && args.addPrompt) {
			lineClasses += " add-prompt";
		}
	}
	if ('string' === typeof data) {
		jQuery('#uwotoutput .output-container').append('<div class="' + lineClasses + '">'+ data +'</div>');
	}
	else if ('object' === typeof data && null !== data) {
		if ('object' === typeof data.cookies && null !== data.cookies) {
		
			var cNames = Object.keys(data.cookies);
			for (let i =0; i < cNames.length; i++) {
				var thisCName = cNames[i];
				var thisCookie = data.cookies[thisCName];
				var curVal = uwotGetCookieValue(thisCName);
				if ('object' === typeof thisCookie && null !== thisCookie && 'string' === typeof thisCookie.value) {
					var thisValue = thisCookie.value;
					var expiry = null;
					if ('string' === typeof thisCookie.expiry) {
						expiry = new Date(thisCookie.expiry);
					}
					else if ('object' === typeof thisCookie.expiry && thisCookie.expiry instanceof Date) {
						expiry = thisCookie.expiry;
					}
					if (thisValue === '' && null !== expiry) {
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
		if ('object' === typeof data.serverListeners && Array.isArray(data.serverListeners)) {
			updateListeners(data.serverListeners);
		}
		if ('string' === typeof data.cwd) {
			changeCwd(data.cwd);
		}
		var browsePath = uwotGetCookieValue('uwotBrowseCurrentPath');
		var browseType = uwotGetCookieValue('uwotBrowseCurrentType');
		var browseStatus = uwotGetCookieValue('uwotBrowseCurrentStatus');
		if ('' !== browsePath && '' !== browseType && 'active' === browseStatus && 'object' === typeof uwotListeners.browse && uwotListeners.browse.status === 'enabled') {
			var browseRenderOpts = {
				isGui: browseType === 'gui',
				isInitial: false
			}
			if (uwotBrowseInstance === null) {
				var browseInstanceOpts = {
					isGui: browseRenderOpts.isGui
				}
				browseRenderOpts.isInitial = true;
				uwotBrowseInstance = new UwotBrowse(uwotListeners.browse, browsePath, browseInstanceOpts);
			}
			uwotBrowseInstance.render(data.output, browsePath, browseRenderOpts);
		}
		else {
			if (uwotBrowseInstance !== null) {
				uwotBrowseInstance.destroy();
				uwotBrowseInstance = null;
			}
			if ('string' === typeof data.output && '' !== data.output) {
				jQuery('#uwotoutput .output-container').append('<div class="' + lineClasses + '">'+ data.output +'</div>');
			}
			if ('undefined' !== typeof data.operations && 'object' === typeof uwotOperations && Array.isArray(uwotOperations)) {
				performOperations(data.operations);
			}
			if ('object' === typeof data.redirect && data.redirect !== null) {
				uwotInterface.disableInput();
				window.setTimeout(uwotClientRedirect(data.redirect), 250);
			}
		}
	}
// 	return;
	//yucky bugs make yuckier things yucky
	if (window.screen.width > 648) {
		return jQuery('#uwotoutput .output-container').scrollTop(1E10);
	}
	else {
		return jQuery('#uwotoutput .output-container').scrollTop(-1E10);
	}

}

jQuery(document).ready(function($) {

	// TBD
	// replace with listener history
// 	uwotHistory = new CliHistory('default');
	
	// set up global interface jQuery selectors
	// TBD
	// consider whether to pull all interface stuff into separate class/file
	uwotInterface.indicator = $('#uwotheader-indicator');
	uwotInterface.cliFields = $('#cliform > .field');
	uwotInterface.cliInput = $('#uwotcli-input');
	uwotInterface.enableInput = function() {
	
		uwotInterface.indicator.removeClass('loading');
		uwotInterface.cliFields.removeClass('disabled');
		uwotInterface.cliInput.prop('disabled', false).val('').focus();
	
	};
	uwotInterface.disableInput = function() {
	
		uwotInterface.indicator.addClass('loading');
		uwotInterface.cliFields.addClass('disabled');
		uwotInterface.cliInput.prop('disabled', true);
	
	};
	uwotInterface.getInputValue = function() {
	
		var inputValue = uwotInterface.cliInput.val();
		return inputValue.trim();
	
	};
	
	// change prompt to login if in login operation
	if ('string' === typeof $("#uwotcli-doLogin").val() && 'true' === $("#uwotcli-doLogin").val()) {
		changePrompt('login');
	}
	// otherwise change prompt to user value
	else {
		changePrompt(user);
	}
	// display cwd in vfs to user
	var initialCwd = '/';
	var storedCwd = localStorage.getItem('UwotCwd');
	if ('string' === typeof storedCwd) {
		initialCwd = storedCwd;
	}
	changeCwd(initialCwd);
	
	// set global isid
	uwotIsid = uwotGetCookieValue('instanceSessionId');
	
	// set up instance session listeners prior to getting server values
	initListeners(uwotIsid);
	
	// set up touch swipe controls for history
	window.addEventListener('touchstart', function() {
		if (!initTouchSupport) {
			$.ajaxSetup({cache: true});
			$.getScript('/javascripts/jquery.touchSwipe.min.js')
			.done(function(script, status) {
				$('#uwotcli').swipe({
					swipeLeft(event, direction, distance, duration, fingerCount) {
						var prevCmd = getCurrentHistory().getPrevItem();
						$("#uwotcli-input").val(prevCmd).focus();	
					},
					swipeRight(event, direction, distance, duration, fingerCount) {
						var nextCmd = getCurrentHistory().getNextItem();
						$("#uwotcli-input").val(nextCmd).focus();
					},
				});
				initTouchSupport = true;
				return initTouchSupport;
			})
			.always(function() {
				$("#uwotcli-input").focus();
				return $.ajaxSetup({cache: false});
			});
		}
	});
	
	// set up keyboard controls for history & autcomplete
	// TBD
	// Actually implement autocomplete
	$("#uwotcli-input").keydown(function(e) {
		switch(e.which) {
			case 9: // tab
				e.preventDefault();
				outputToMain('You probably wish autocomplete was implemented, don\'t you?');
				return false;
				break;
			case 38: // up
				e.preventDefault();
				var prevCmd = getCurrentHistory().getPrevItem();
				$("#uwotcli-input").val(prevCmd).focus();
				break;

			case 40: // down
				e.preventDefault();
				var nextCmd = getCurrentHistory().getNextItem();
				$("#uwotcli-input").val(nextCmd).focus();
				break;

			default: return; // exit this handler for other keys
		}
	});
	
	// clicks/taps on non-interactive terminal refocus to cli input field
	$('#uwotterminal').click(function() {
	
		if (!uwotInteractive) {
		
			$("#uwotcli-input").focus();
		
		}
	
	});
	
	// start out with focus on cli input
	$("#uwotcli-input").focus();
	
	// submit CLI input to server for processing from form
	// TBD
	// refactor to use UwotCliListener class ... in progress
	$("#uwotcli").submit(function(e) {
		e.preventDefault();
		var op = uwotInterface.getInputValue();
		if (op === '') {
			outputToMain(op, {addPrompt:true});
			uwotInterface.enableInput();
		}
		else {
			uwotInterface.cliInput.val('').focus();
			var pathNonce = $('#uwotcli-nonce').val();
			var listenerNonce = $('#uwotcli-listenerNonce').val(); // will be in the listener, eventually.
			uwotInterface.disableInput();
			var data = {
				cmd: op,
				nonce: pathNonce,
				cwd: localStorage.getItem('UwotCwd')
			};
			var whereToPool = getEnabledListeners();
			if (whereToPool.length === 1) {
			
				if (whereToPool[0].type !== 'default' && 'string' === typeof whereToPool[0].nonce) {
				
					data.nonce = whereToPool[0].nonce;
				
				}
				whereToPool[0].post(data);
			
			}
			else {
			
			// TBD
			// Handle cmdSet matching for additional listeners here? 
			// can also send everything to default and have server parse it out. (makes more sense, but slower)
			// decisions...
			
			}
		}
	});
	
	// set up to resize and reorder elements responsively to window width change
	$(window).resize(function() {
        window.setTimeout(onWidth(), 1000);
    });
    
    // resize and reorder elements after page is ready at initial load
    onWidth();

});
