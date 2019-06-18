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

	var globalListeners = ensureGlobalListener(isid);
	if ('object' !== typeof globalListeners.default && null !== globalListeners.default) {
	
		globalListeners.default = new Listener('default', isid);
	
	}
	return globalListeners.default;

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

function enableExclusiveState(isid) {

	var globalListeners = ensureGlobalListener(isid);
	var disabledForExclusive = [];
	var allListenerNames = Object.keys(globalListeners);
	for (let i = 0; i < allListenerNames.length; i++) {
	
		if (globalListeners[allListenerNames[i]].type !== 'exclusive' && globalListeners[allListenerNames[i]].status === 'enabled') {
		
			disabledForExclusive.push(allListenerNames[i]);
			globalListeners[allListenerNames[i]].disable();
		
		}
		if ((i + 1) >= allListenerNames.length) {
		
			globalListeners.disabledForExclusive = disabledForExclusive;
			return disabledForExclusive;
		
		}
	
	}

}

function disableExclusiveState(isid) {

	var globalListeners = ensureGlobalListener(isid);
	var enabledListeners = [];
	if ('object' === globalListeners.disabledForExclusive && Array.isArray(globalListeners.disabledForExclusive) && globalListeners.disabledForExclusive.length > 0) {
	
		for (let i = 0; i < globalListeners.disabledForExclusive.length; i++) {
		
			globalListeners[globalListeners.disabledForExclusive[i]].enable;
			enabledListeners.push(globalListeners.disabledForExclusive[i]);
			if ((i + 1) >= globalListeners.length) {
			
				delete globalListeners.disabledForExclusive;
				return enabledListeners;
			
			}
		
		}
	
	}
	else {
	
		return enabledListeners;
	
	}

}

module.exports = {
	ensureGlobalListener,
	removeGlobalListener,
	newIsidDefaultListener,
	moveListeners,
	enableExclusiveState,
	disableExclusiveState
};
