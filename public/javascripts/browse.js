'use strict';
/* global jQuery, UwotCliListener, CliHistory, UwotGui, performOperations,  uwotSetCookie */

const getDefaultUwotBrowseOpts = function() {
	return {
		isGui: false
	};
};

class UwotBrowse {
	constructor(listener, initialPath, opts) {
		if ('object' !== typeof listener || !(listener instanceof UwotCliListener)) {
			throw new TypeError('invalid listener passed to UwotBrowse constructor');
		}
		else if (listener.name !== 'browse' || listener.status !== 'enabled') {
			throw new Error('listener must be an enabled browse listener');
		}
		if ('string' !== typeof initialPath || '' === initialPath) {
			initialPath = null;
		}
		if ('object' === typeof opts && null !== opts) {
			opts.isGui = 'boolean' === typeof opts.isGui && true === opts.isGui;
		}
		else {
			opts = getDefaultUwotBrowseOpts();
		}
		this.isid = listener.isid;
		this.listener = listener;
		this.history = new CliHistory('browse_' + this.isid);
		this.currentPath = initialPath;
		if (null !== this.currentPath) {
			this.history.addItem(this.currentPath);
		}
		this.isGui = opts.isGui;
		this.gui = null;
		var self = this;
		var changeLoadPath = function(reqData) {
			var oldCmd = reqData.cmd;
			if (oldCmd.indexOf('go') === 0) {
				reqData.cmd = oldCmd + ' ' + uwotGetCookieValue('uwotBrowseCurrentType');
			}
			else {
				switch (oldCmd) {
					case 'fwd':
						reqData.cmd = 'go ' + self.getFwdPath() + ' ' + uwotGetCookieValue('uwotBrowseCurrentType');
						break;
					case 'back':
						reqData.cmd = 'go ' + self.getBackPath() + ' ' + uwotGetCookieValue('uwotBrowseCurrentType');
						break;
					case 'reload':
						reqData.cmd = 'go ' + self.getReloadPath() + ' ' + uwotGetCookieValue('uwotBrowseCurrentType');
						break;
					default:
						uwotSetCookie('uwotBrowseLastOperation', oldCmd);
				}
			}
			return reqData;
		};
		this.changeLoadPath = changeLoadPath;
		this.listener.addHook('beforePost', this.changeLoadPath);
	}
	destroy() {
		delete this.history;
		if (null !== this.gui) {
			this.gui.destroy();
			this.gui = null;
		}
		else {
			performOperations('clear');	
		}
		this.listener.removeHook('beforePost', this.changeLoadPath.name);
		this.listener = null;
	}
	render(content, path, opts) {
		if ('string' !== typeof content) {
			throw new TypeError('invalid content passed to UwotBrowse.render');
		}
		if ('string' !== typeof path) {
			throw new TypeError('invalid path passed to UwotBrowse.render');
		}
		var isInitial = false;
		var addToHistory = true;
		if ('object' === typeof opts && null !== opts) {
			this.isGui = 'boolean' === typeof opts.isGui && true === opts.isGui;
			isInitial = 'boolean' === typeof opts.isInitial && true === opts.isInitial;
			addToHistory = 'boolean' === typeof opts.addToHistory && true === opts.addToHistory;
		}
		if (!isInitial && addToHistory) {
			this.history.addItem(path);
		}
		if (this.isGui) {
			if (null === this.gui) {
				this.gui = new UwotGui();
			}
			this.gui.update(content);
		}
		else {
			if (null !== this.gui) {
				this.gui.destroy();
				this.gui = null;
			}
			else {
				performOperations('clear');	
			}
			jQuery('#uwotoutput .output-container').html(content);
		}
	}
	getFwdPath() {
		var pathVal = this.history.getNextItem();
		uwotSetCookie('uwotBrowseLastOperation', 'fwd');
		return pathVal;
	}
	getBackPath() {
		var pathVal = this.history.getPrevItem();
		uwotSetCookie('uwotBrowseLastOperation', 'back');
		return pathVal;
	}
	getReloadPath() {
		var pathVal = this.currentPath;
		uwotSetCookie('uwotBrowseLastOperation', 'reload');
		return pathVal;
	}
}
// class contains instance methods for opening, closing, and maintaining browse instance in the user interface
