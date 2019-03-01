'use strict';
const INDEX_FIELD = 'UwotHistoryIndex';
const INTVL_FIELD = 'UwotHistoryInterval';
const INDEX_PREFIX = 'uwotclih';
class CliHistory {

	constructor() {
	
		var self = this;
		var storedIndex = self.getAsInt(INDEX_FIELD);
		if (storedIndex === null || 'number' !== typeof storedIndex || storedIndex < 0) {
		
			storedIndex = 0;
			self.clearHistory();
		
		}
		else {
		
			this.index = storedIndex;
		
		}
		self.resetInterval();
	
	}
	
	clearHistory() {
	
		localStorage.setItem(INDEX_FIELD, 0);
		this.index = 0;
		var storageArray = [];
		for (let i = 0; i < localStorage.length; i++) {
		
			if (localStorage.key(i).substring(0, INDEX_PREFIX.length) === INDEX_PREFIX) {
			
				storageArray.push(localStorage.key(i));
			
			}
		
		}
		for (let j = 0; j < storageArray.length; j++) {
		
			localStorage.removeItem(storageArray[j]);
		
		}
		return;
	
	}
	
	
	addItem(cmd) {
	
		if ('string' !== typeof cmd) {
		
			return false;
		
		}
		else {
		
			var cidx = this.getCurrentIndex();
			var nidx = cidx + 1;
			try {
			
				if (cidx === 0 &&  null === localStorage.getItem(INDEX_PREFIX + 0)) {
				
					localStorage.setItem(INDEX_PREFIX + cidx, cmd);
				
				}
				else {
				
					localStorage.setItem(INDEX_PREFIX + nidx, cmd);
					localStorage.setItem(INDEX_FIELD, nidx);
					this.index = nidx;
				
				}	
				this.resetInterval();
				return nidx;
			
			}
			catch(error) {
			
				console.error(error);
				return cidx;
			
			}
		
		}
	
	}
	
	getPrevItem() {
	
		var cidx = this.getCurrentIndex();
		var lintvl = this.getLastInterval();
		if (cidx === 0 && null === localStorage.getItem(INDEX_PREFIX + 0)) {
		
			return '';
		
		}
		else if (cidx === 0 && null !== localStorage.getItem(INDEX_PREFIX + 0)) {
		
			return localStorage.getItem(INDEX_PREFIX + 0);
		
		}
		else {
		
			this.decrementInterval();
			var intvlIdx = parseInt(lintvl) + parseInt(cidx);
			if (intvlIdx <= 0) {
			
				this.incrementInterval();
				return localStorage.getItem(INDEX_PREFIX + 0);
			
			}
			else {
			
				return localStorage.getItem(INDEX_PREFIX + intvlIdx.toString());
			
			}
		
		}
	
	}
	
	getNextItem() {
	
		var cidx = this.getCurrentIndex();
		var intvl = this.incrementInterval();
		var intvlIdx = parseInt(cidx) + parseInt(intvl);
		if (null === localStorage.getItem(INDEX_PREFIX + intvlIdx.toString())) {
		
			this.decrementInterval();
			return '';
		
		}
		else {
			
			return localStorage.getItem(INDEX_PREFIX + intvlIdx.toString());
		
		}
	
	}
	
	getCurrentIndex() {
	
		var cidx = this.getAsInt(INDEX_FIELD);
		if (null === cidx || 'number' !== typeof cidx || cidx < 0) {
		
			this.clearHistory();
			return 0;
		
		}
		else {
		
			return cidx;
		
		}
	
	}
	
	getLastInterval() {
	
		var lintvl = this.getAsInt(INTVL_FIELD);
		if (null === lintvl || 'number' !== typeof lintvl) {
		
			return this.resetInterval();
		
		}
		else {
		
			return lintvl;
		
		}
	
	}
	
	resetInterval() {
	
		localStorage.setItem(INTVL_FIELD, 0);
		return 0;
	
	}
	
	decrementInterval() {
	
		var lintvl = this.getLastInterval();
		var intvl = parseInt(lintvl) - 1;
		localStorage.setItem(INTVL_FIELD, intvl);
		return intvl;
	
	}
	
	incrementInterval() {
	
		var lintvl = this.getLastInterval();
		var intvl = parseInt(lintvl) + 1;
		localStorage.setItem(INTVL_FIELD, intvl);
		return intvl;
	
	}
	
	getAsInt(key) {
	
		var intRes = parseInt(localStorage.getItem(key));
		return isNaN(intRes) ? null : intRes;
	
	}
	
	getAllItems() {
		var storageArray = [];
		for (var i = 0; i < localStorage.length; i++) {
		
			if (localStorage.key(i).substring(0, INDEX_PREFIX.length) === INDEX_PREFIX) {
			
				storageArray.push(localStorage.getItem(localStorage.key(i)));
			
			}
		
		}
		return storageArray;
	}

}
