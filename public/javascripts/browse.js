'use strict';
/* global jQuery, UwotCliListener, CliHistory, UwotGui, performOperations,  uwotSetCookie, uwotGetCookieValue */

const getDefaultUwotBrowseOpts = function() {
	return {
		isGui: false
	};
};

const getCliLinksHtml = function() {
	return '<div id="uwotBrowseLinks" class="uwot-browse-modal"><h3 class="uwot-browse-modal-title">Select from these links:</h3><div class="uwot-browse-modal-content"></div></div>';
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
			else if (oldCmd.indexOf('select') === 0) {
			
				var linkIdx = parseInt(oldCmd.replace('select', '').trim());
				var linkHref = self.getAttrForLink(linkIdx, 'href');
				var linkTarget = self.getAttrForLink(linkIdx, 'target');
				if (Number.isNaN(linkIdx)) {
				
					reqData.cmd = 'go ' + self.getReloadPath() + ' ' + uwotGetCookieValue('uwotBrowseCurrentType') + 'invalid link index selected';
				
				}
				else if ('string' !== typeof linkHref || '' === linkHref) {
				
					reqData.cmd = 'go ' + self.getReloadPath() + ' ' + uwotGetCookieValue('uwotBrowseCurrentType') + 'link index selected has invalid target URI';
				
				}
				else if ('_blank' === linkTarget) {
				
					self.goToExternalLink(linkIdx);
					reqData.cmd = '';
					return reqData;
				
				}
				else {
					
					reqData.cmd = 'select ' + linkIdx + ' ' + linkHref + ' ' + uwotGetCookieValue('uwotBrowseCurrentType');
				
				}
			
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
			var cliLinks = jQuery('#uwotoutput .output-container a');
			jQuery('#uwotoutput .output-container').append(getCliLinksHtml());
			cliLinks.each((idx, el) => {
				let linkNo = jQuery(el).attr('data-link-num');
				let linkHref = jQuery(el).attr('href');
				let linkTarget = jQuery(el).attr('target');
				linkTarget = 'string' === typeof linkTarget && '_blank' === linkTarget ? linkTarget : '_self';
				let linkTxt = jQuery(el).text();
				jQuery('#uwotBrowseLinks .uwot-browse-modal-content').append('<div class="uwot-browse-modal-content-line" data-link-href="' + linkHref + '" data-link-num="' + linkNo + '" data-link-target="' + linkTarget + '"><span class="uwot-browse-modal-link-num">' + linkNo + '</span>&nbsp;<span class="uwot-browse-modal-link-name">' + linkTxt + '</span></div>');
			});
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
	getAttrForLink(idx, attrName) {
		var attrVal;
		if ('string' === typeof attrName) {
			switch(attrName) {
				case 'href':
					attrVal = jQuery('#uwotBrowseLinks .uwot-browse-modal-content .uwot-browse-modal-content-line[data-link-num="' + idx + '"]').attr('data-link-href');
					break;
				case 'target':
					attrVal = jQuery('#uwotBrowseLinks .uwot-browse-modal-content .uwot-browse-modal-content-line[data-link-num="' + idx + '"]').attr('data-link-target');
			}
		}
		return attrVal;
	}
	goToExternalLink(idx) {
		var idxLink = jQuery('#uwotoutput .output-container .browseOutput a[data-link-num="' + idx + '"]');
		idxLink[0].click();
	}
}
// class contains instance methods for opening, closing, and maintaining browse instance in the user interface
