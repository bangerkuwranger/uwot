var Listener = require('../listener');

function ensureGlobalListener(isid) {

	if ('object' !== typeof global.Uwot.Listeners) {
	
		global.Uwot.Listeners = {};
	
	}
	if ('object' !== typeof global.Uwot.Listeners[isid]) {
	
		global.Uwot.Listeners[isid] = {};
	
	}
	return global.Uwot.Listeners[isid];

}

function removeGlobalListener(isid) {

	try {
	
		delete global.Uwot.Listeners[isid];
		return true;
	
	}
	catch(e) {
	
		return false;
	
	}

}

function newIsidDefaultListener(isid) {

	var globalListener = ensureGlobalListener(isid);
	if ('object' !== typeof globalListener.default && null !== globalListener.default) {
	
		globalListener.default = new Listener('default', isid);
	
	}
	return globalListener.default;

}

function moveListeners(currentIsid, newIsid) {

	var currentListenersObj = ensureGlobalListener(currentIsid);
	var currentListenerNames = Object.keys(currentListenersObj);
	var newListenersObj = ensureGlobalListener(newIsid);
	if (currentListenerNames.length < 1) {
	
		newIsidDefaultListener(newIsid);
		return newListenersObj;
	
	}
	else {
	
		for (let i = 0; i < currentListenerNames.length; i++) {
		
			var oldListener = currentListenersObj[currentListenerNames[i]];
			var newListener = Object.assign({}, oldListener);
			newListener.instanceSessionId = newIsid;
			newListenersObj[currentListenerNames[i]] = newListener;
			oldListener.disable();
			if ((i + 1) >= currentListenerNames.length) {
			
				removeGlobalListener(currentIsid);
				return newListenersObj;
			
			}
		
		}
	
	}

}

module.exports = {

	ensureGlobalListener,
	removeGlobalListener,
	newIsidDefaultListener,
	moveListeners

};
