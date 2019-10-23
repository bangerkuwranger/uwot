'use strict';
/* global jQuery, UwotCliListener, CliHistory, UwotGui, performOperations,  uwotSetCookie, uwotGetCookieValue, uwotConsoleOnClick, uwotBrowseInstance */

const getDefaultUwotBrowseOpts = function() {
	return {
		isGui: false
	};
};

const getModalHtml = function() {
	return '<div id="uwotBrowseModal" class="uwot-browse-modal" style="display: none;"><h3 class="uwot-browse-modal-title"></h3><div class="uwot-browse-modal-content"></div><div id="uwotBrowseModalContent" style="display: none;"></div></div>';
};

const getMsgHtml = function(msg, msgClass) {
	const validClasses = [
		'debug',
		'info',
		'warn',
		'error'
	];
	if ('string' !== typeof msg || '' === msg) {
		return '';
	}
	if ('string' !== typeof msgClass || -1 === validClasses.indexOf(msgClass)) {
		msgClass = 'info';
	}
	return '<div id="UwotBrowseMsg" class="uwot-browse-msg ' + msgClass + '" style="display: none;><span class="uwot-browse-msg-icon"></span><span class="uwot-browse-msg-text">' + msg + '</span><span class="uwot-browse-msg-close" onClick="uwotBrowseInstance.removeMsg()">X</span></div>';
}

// class contains instance methods for opening, closing, and maintaining browse instance in the user interface

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
		this.listener.addHook('beforePost', this.performBrowseOperations);
		this.listener.addHook('beforePost', this.changeLoadPath);
		this.modal = new UwotBrowseModal();
	}
	destroy() {
		delete this.history;
		this.modal.destroy();
		this.modal = null;
		if (null !== this.gui) {
			this.gui.destroy();
			this.gui = null;
		}
		else {
			performOperations('clear');	
		}
		this.listener.removeHook('beforePost', this.performBrowseOperations.name);
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
		var message = false;
		if ('object' === typeof opts && null !== opts) {
			this.isGui = 'boolean' === typeof opts.isGui && true === opts.isGui;
			isInitial = 'boolean' === typeof opts.isInitial && true === opts.isInitial;
			addToHistory = 'boolean' === typeof opts.addToHistory && true === opts.addToHistory;
			message = 'string' === typeof opts.msg ? opts.msg : message;
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
		// generate modal content
		if (!this.modal.initialized) {
			this.modal.init();
		}
		else {
			this.modal.refreshAllContent();
		}
		if (message) {
			this.displayMsg(message);
		}
	}
	displayMsg(msg, msgClass) {
		var self = this;
		var msgHtml = getMsgHtml(msg, msgClass);
		if ('string' === typeof msgHtml && '' !== msgHtml) {
			this.container.prepend(msgHtml);
			return jQuery('#UwotBrowseMsg').fadeIn(400, function() {
				window.setTimeout(self.removeMsg, 15000);
			});
			
		}
		else {
			return false;
		}
	}
	removeMsg() {
	
		jQuery('#UwotBrowseMsg').remove();
	
	}
	getFwdPath() {
		this.history.incrementInterval();
		var pathVal = this.history.getNextItem();
		uwotSetCookie('uwotBrowseLastOperation', 'fwd');
		return pathVal;
	}
	getBackPath() {
		this.history.decrementInterval();
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
		var attrVal, $link = this.modal.selectLink(idx);
		if ('string' === typeof attrName && null !== $link) {
			switch(attrName) {
				case 'href':
					attrVal = $link.attr('data-link-href');
					break;
				case 'target':
					attrVal = $link.attr('data-link-target');
					break;
			}
		}
		return attrVal;
	}
	goToExternalLink(idx) {
		var idxLink = jQuery('#uwotoutput .output-container .browseOutput a[data-link-num="' + idx + '"]');
		if (idxLink.length > 0) {
			idxLink[0].click();
		}
		else {
			console.error('invalid link index for goToExternalLink');
		}
		return;
	}
	performBrowseOperations(reqData) {
		var self = this;
		var oldCmd = reqData.cmd.trim();
		var noGo = false;
		var msg = ' "browse operation performed"';
		if (0 === oldCmd.indexOf('clear')) {
			msg = '';
			noGo = true;
			performOperations('clear');
		}
		else if (0 === oldCmd.indexOf('opacity') {
			oldCmd = oldCmd.replace('opacity', '').trim();
			oldCmdArr = oldCmd.split(' ');
			var setOpacity = this.modal.opacity(oldCmdArr[0]);
			noGo = true;
			msg = setOpacity ? ' "panel opacity: ' + oldCmdArr[0] + '%"' : ' "opacity must be a number in range 0-100"'
		}
		else if (0 === oldCmd.indexOf('hide') {
			this.modal.hide();
			noGo = true;
			msg = ' "panel hidden"';
		}
		else if (0 === oldCmd.indexOf('show') {
			oldCmd = oldCmd.replace('show', '').trim();
			oldCmdArr = oldCmd.split(' ');
			var panelName;
			if (oldCmdArr.length > 0) {
				panelName = oldCmdArr[0];
			}
			var setPanel = this.modal.show(panelName);
			noGo = true;
			msg = ' " panel';
			msg += setPanel ? ' ' + setPanel + ' shown"' : ' shown"';
		}
		if (noGo) {
			reqData.cmd = 'nogo ' + self.getReloadPath() + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui') + msg;
		}
		return reqData;
	}
	changeLoadPath(reqData) {
		var self = this;
		var oldCmd = reqData.cmd;
		var oldCmdArr = oldCmd.trim().split(' ');
		if (oldCmdArr[0] === 'go' && 'string' !== typeof oldCmdArr[2]) {
			reqData.cmd = oldCmd + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui');
		}
		else if (oldCmdArr[0] === 'select' && oldCmdArr[1] === 'link') {
			var linkIdx = parseInt(oldCmdArr[2]);
			var linkHref = self.getAttrForLink(linkIdx, 'href');
			var linkTarget = self.getAttrForLink(linkIdx, 'target');
			if (Number.isNaN(linkIdx)) {
				reqData.cmd = 'go ' + self.getReloadPath() + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui') + ' "invalid link index selected"';
			}
			else if ('string' !== typeof linkHref || '' === linkHref) {
				reqData.cmd = 'nogo ' + self.getReloadPath() + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui') + ' "link index selected has invalid target URI"';
			}
			else if ('_blank' === linkTarget) {
				self.goToExternalLink(linkIdx);
				reqData.cmd = 'nogo ' + self.getReloadPath() + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui') + ' "external link opened in new tab or window"';
				return reqData;
			}
			else {
				reqData.cmd = 'go ' + linkHref + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui');
			}
		}
		else {
			switch (oldCmd) {
				case 'fwd':
					reqData.cmd = 'go ' + self.getFwdPath() + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui');
					break;
				case 'back':
					reqData.cmd = 'go ' + self.getBackPath() + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui');
					break;
				case 'reload':
					reqData.cmd = 'go ' + self.getReloadPath() + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui');
					break;
				default:
					uwotSetCookie('uwotBrowseLastOperation', oldCmd);
			}
		}
		return reqData;
	}
}

class UwotBrowseModal {
	constructor() {
		this.visible = false;
		this.panelNames = [
			'links',
			'forms',
			'history'
		];
		this.container = null;
		this.initialized = false;
		this.currentPanel = null;
	}
	show(panelName) {
		var validArg = true;
		var wasSet = false;
		if ('string' !== typeof panelName || -1 === this.panelNames.indexOf(panelName)) {
			panelName = 'links';
			validArg = false;
		}
		if (!this.initialized) {
			this.init(false);
		}
		if (null === this.currentPanel || (validArg && panelName !== this.currentPanel)) {
			this.setPanel(panelName);
			wasSet = true;
		}
		this.container.fadeIn();
		this.visible = true;
		return wasSet ? panelName : false;
	}
	hide() {
		this.container.fadeOut();
		this.visible = false;
	}
	opacity(opacityPct) {
		if ('number' === typeof opacityPct || ('string' === typeof opacityPct && 'number' === typeof parseInt(opacityPct))) {
			// only uses the whole number without rounding
			opacityPct = parseInt(opacityPct);
			if (opacityPct > 100) {
				opacityPct = 100;
			}
			else if (opacityPct < 0) {
				opacityPct = 0;
			}
			if (opacityPct === 0) {
				this.hide();
				return '0';
			}
			else {
				var opacityFloat = opacityPct/100;
				if (!this.visible) {
					this.show();
				}
				this.container.fadeTo(400, opacityFloat);
				return opacityPct.toString();
			}
		}
		else {
			console.error('Invalid opacity percentage: ' + opacityPct);
			return false;
		}
	}
	init(showOnInit, firstPanel) {
		showOnInit = 'boolean' === typeof showOnInit && true === showOnInit;
		if ('string' !== typeof firstPanel || -1 === this.panelNames.indexOf(firstPanel)) {
			firstPanel = 'links';
		}
		var currentModal = jQuery('#uwotBrowseModal');
		if (currentModal.length > 0) {
			currentModal.remove();
		}
		jQuery('#uwotoutput .output-container').append(getModalHtml());
		this.container = jQuery('#uwotBrowseModal');
		this.container.find('#uwotBrowseModalContent').append(this.getLinksContent());
		this.container.find('#uwotBrowseModalContent').append(this.getFormsContent());
		this.container.find('#uwotBrowseModalContent').append(this.getHistoryContent());
		this.setPanel(firstPanel);
		if (showOnInit) {
			this.show();
		}
		this.initialized = true;
		return;
	}
	destroy() {
		this.container = null;
		jQuery('#uwotBrowseModal').remove();
		this.initialized = false;
		return;
	}
	setPanel(panelName) {
		if ('string' !== typeof panelName || -1 === this.panelNames.indexOf(panelName)) {
			panelName = 'links';
		}
		var thisPanelContent = jQuery('#uwotBrowseModalContent [data-panel-name="' + panelName + '"]');
		this.container.find('.uwot-browse-modal-title').html(thisPanelContent.find('title').html());
		this.container.find('.uwot-browse-modal-content').html(thisPanelContent.find('content').html());
		this.currentPanel = panelName;
		return;
	}
	getLinksContent() {
		var linksContentHtml = '<div class="uwot-browse-modal-panel-content" data-panel-name="links"><title>Links</title><content>';
		var cliLinks = jQuery('#uwotoutput #uwotBrowseHtml a');
		if (cliLinks.length > 0) {
			jQuery('a.uwot-console-link').click(function(e) {
				uwotConsoleOnClick(this, e);
			});
			jQuery('#uwotoutput .output-container').append(getCliLinksHtml());
			cliLinks.each((idx, el) => {
				let linkNo = jQuery(el).attr('data-link-num');
				let linkHref = jQuery(el).attr('href');
				let linkTarget = jQuery(el).attr('target');
				linkTarget = 'string' === typeof linkTarget && '_blank' === linkTarget ? linkTarget : '_self';
				let linkTxt = jQuery(el).text();
				linksContentHtml += '<div class="uwot-browse-modal-content-line" data-link-href="' + linkHref + '" data-link-num="' + linkNo + '" data-link-target="' + linkTarget + '"><span class="uwot-browse-modal-link-num">' + linkNo + '</span>&nbsp;<span class="uwot-browse-modal-link-name">' + linkTxt + '</span></div>';
			});
		}
		else {
			linksContentHtml += '<h4>No links found.</h4>';
		}
		linksContentHtml += '</content></div>';
		return linksContentHtml;
	}
	getFormsContent() {
		var formsContentHtml = '<div class="uwot-browse-modal-panel-content" data-panel-name="forms"><title>Forms</title><content>';
		var cliForms = jQuery('#uwotoutput #uwotBrowseHtml form');
		formsContentHtml += '<h4>No forms found.</h4>';
		formsContentHtml += '</content></div>';
		return formsContentHtml;
	}
	getHistoryContent() {
		var formsContentHtml = '<div class="uwot-browse-modal-panel-content" data-panel-name="history"><title>History</title><content>';
		formsContentHtml += '<h4>No history found.</h4>';
		formsContentHtml += '</content></div>';
		return formsContentHtml;
	}
	refreshAllContent() {
		this.container.find('#uwotBrowseModalContent').append(this.getLinksContent());
		this.container.find('#uwotBrowseModalContent').append(this.getFormsContent());
		this.container.find('#uwotBrowseModalContent').append(this.getHistoryContent());
		if (null === this.currentPanel) {
			this.currentPanel = 'links';
		}
		this.setPanel(this.currentPanel);
		return;
	}
	selectLink(linkIdx) {
		var $link = this.container.find('#uwotBrowseModalContent [data-panel-name="links"] content .uwot-browse-modal-content-line[data-link-num="' + linkIdx + '"]');
		if ($link.length < 1) {
			$link = null;
		}
		return $link;
	}
	selectForm(formIdx) {
	
	}
	selectHistory(histIdx) {
	
	}
}
