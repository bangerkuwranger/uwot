'use strict';
const INDEX_FIELD = 'UwotHistoryIndex';
const INTVL_FIELD = 'UwotHistoryInterval';
const INDEX_PREFIX = 'uwotclih';
class CliHistory {

	constructor(postfix) {
	
		postfix = 'string' === typeof postfix && '' !== postfix ? '_' + postfix : '';
		this.indexName = INDEX_FIELD + postfix;
		this.intvlName = INTVL_FIELD + postfix;
		this.indexPrefix = INDEX_PREFIX + postfix;
		var self = this;
		var storedIndex = self.getAsInt(this.indexName);
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
	
		localStorage.setItem(this.indexName, 0);
		this.index = 0;
		var storageArray = [];
		for (let i = 0; i < localStorage.length; i++) {
		
			if (localStorage.key(i).substring(0, this.indexPrefix.length) === this.indexPrefix) {
			
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
			
				if (cidx === 0 &&  null === localStorage.getItem(this.indexPrefix + 0)) {
				
					localStorage.setItem(this.indexPrefix + cidx, cmd);
				
				}
				else {
				
					localStorage.setItem(this.indexPrefix + nidx, cmd);
					localStorage.setItem(this.indexName, nidx);
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
		if (cidx === 0 && null === localStorage.getItem(this.indexPrefix + 0)) {
		
			return '';
		
		}
		else if (cidx === 0 && null !== localStorage.getItem(this.indexPrefix + 0)) {
		
			return localStorage.getItem(this.indexPrefix + 0);
		
		}
		else {
		
			this.decrementInterval();
			var intvlIdx = parseInt(lintvl) + parseInt(cidx);
			if (intvlIdx <= 0) {
			
				this.incrementInterval();
				return localStorage.getItem(this.indexPrefix + 0);
			
			}
			else {
			
				return localStorage.getItem(this.indexPrefix + intvlIdx.toString());
			
			}
		
		}
	
	}
	
	getNextItem() {
	
		var cidx = this.getCurrentIndex();
		var intvl = this.incrementInterval();
		var intvlIdx = parseInt(cidx) + parseInt(intvl);
		if (null === localStorage.getItem(this.indexPrefix + intvlIdx.toString())) {
		
			this.decrementInterval();
			return '';
		
		}
		else {
			
			return localStorage.getItem(this.indexPrefix + intvlIdx.toString());
		
		}
	
	}
	
	getCurrentIndex() {
	
		var cidx = this.getAsInt(this.indexName);
		if (null === cidx || 'number' !== typeof cidx || cidx < 0) {
		
			this.clearHistory();
			return 0;
		
		}
		else {
		
			return cidx;
		
		}
	
	}
	
	getLastInterval() {
	
		var lintvl = this.getAsInt(this.intvlName);
		if (null === lintvl || 'number' !== typeof lintvl) {
		
			return this.resetInterval();
		
		}
		else {
		
			return lintvl;
		
		}
	
	}
	
	resetInterval() {
	
		localStorage.setItem(this.intvlName, 0);
		return 0;
	
	}
	
	decrementInterval() {
	
		var lintvl = this.getLastInterval();
		var intvl = parseInt(lintvl) - 1;
		localStorage.setItem(this.intvlName, intvl);
		return intvl;
	
	}
	
	incrementInterval() {
	
		var lintvl = this.getLastInterval();
		var intvl = parseInt(lintvl) + 1;
		localStorage.setItem(this.intvlName, intvl);
		return intvl;
	
	}
	
	getAsInt(key) {
	
		var intRes = parseInt(localStorage.getItem(key));
		return isNaN(intRes) ? null : intRes;
	
	}
	
	getAllItems() {
		var storageArray = [];
		for (var i = 0; i < localStorage.length; i++) {
		
			if (localStorage.key(i).substring(0, this.indexPrefix.length) === this.indexPrefix) {
			
				storageArray.push(localStorage.getItem(localStorage.key(i)));
			
			}
		
		}
		return storageArray;
	}

}
