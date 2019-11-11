var Listener = require('../listener');
const nonceHandler = require('node-timednonce');

module.exports = {

	ensureGlobalListener(isid) {

		if ('object' !== typeof global.Uwot.Listeners) {
	
			global.Uwot.Listeners = {};
	
		}
		if ('object' !== typeof global.Uwot.Listeners[isid]) {
	
			global.Uwot.Listeners[isid] = {};
	
		}
		return global.Uwot.Listeners[isid];

	},

	removeGlobalListener(isid) {

		try {
	
			delete global.Uwot.Listeners[isid];
			return true;
	
		}
		// this is only really possible if global is not available...
		catch(e) {
	
			return false;
	
		}

	},

	newIsidDefaultListener(isid) {

		var globalListeners = this.ensureGlobalListener(isid);
		if ('object' !== typeof globalListeners.default || null === globalListeners.default) {
	
			try {
		
				delete globalListeners.default;
				globalListeners.default = new Listener('default', isid);
		
			}
			catch(e) {
		
				return e;
		
			}
	
		}
		return globalListeners.default;

	},

	moveListeners(currentIsid, newIsid) {

		var currentListenersObj = this.ensureGlobalListener(currentIsid);
		var currentListenerNames = Object.keys(currentListenersObj);
		var newListenersObj = this.ensureGlobalListener(newIsid);
		if (currentListenerNames.length < 1) {
	
			this.newIsidDefaultListener(newIsid);
			return newListenersObj;
	
		}
		else {
	
			for (let i = 0; i < currentListenerNames.length; i++) {
		
				var oldListener = currentListenersObj[currentListenerNames[i]];
				var newListener = Object.assign({}, oldListener);
				newListener.isid = newIsid;
				newListenersObj[currentListenerNames[i]] = newListener;
				oldListener.disable();
				if ((i + 1) >= currentListenerNames.length) {
			
					this.removeGlobalListener(currentIsid);
					return newListenersObj;
			
				}
		
			}
	
		}

	},

	enableExclusiveState(isid) {

		var globalListeners = this.ensureGlobalListener(isid);
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

	},

	disableExclusiveState(isid) {

		var globalListeners = this.ensureGlobalListener(isid);
		var enabledListeners = [];
		if ('object' === typeof globalListeners.disabledForExclusive && Array.isArray(globalListeners.disabledForExclusive) && globalListeners.disabledForExclusive.length > 0) {
	
			for (let i = 0; i < globalListeners.disabledForExclusive.length; i++) {
		
				globalListeners[globalListeners.disabledForExclusive[i]].enable();
				enabledListeners.push(globalListeners.disabledForExclusive[i]);
				if ((i + 1) >= globalListeners.disabledForExclusive.length) {
			
					delete globalListeners.disabledForExclusive;
					return enabledListeners;
			
				}
		
			}
	
		}
		else {
	
			return enabledListeners;
	
		}

	},
	
	getServerListeners(isid) {
	
		var globalListeners = [];
		if ('string' !== typeof isid || '' === isid) {
		
			return globalListeners;
		
		}
		globalListeners = this.ensureGlobalListener(isid);
		var allListenerNames = Object.keys(globalListeners);
		var serverListeners = [];
		if (allListenerNames.length < 1) {
		
			return serverListeners;
		
		}
		for (let i = 0; i < allListenerNames.length; i++) {
		
			if (allListenerNames[i] !== 'disabledForExclusive') {
			
				let thisListener = globalListeners[allListenerNames[i]];
				let thatListener = {
					name:		thisListener.name,
					options:	{
						type:	thisListener.type,
						path:	thisListener.routeUriPath,
						cmdSet:	thisListener.cmdSet,
						isid:	thisListener.isid,
						nonce:	nonceHandler.create(isid + '-listener-' + thisListener.name, 300000)
					},
					status:		thisListener.status,
				
				};
				serverListeners.push(thatListener);
			
			}
			if ((i + 1) >= allListenerNames.length) {
		
				return serverListeners;
		
			}
	
		}
	
	}

};
