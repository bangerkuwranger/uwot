'use strict';
/* global jQuery, UwotCliListener, CliHistory, UwotGui, performOperations,  uwotSetCookie, uwotGetCookieValue, uwotConsoleOnClick, uwotBrowseInstance */

const UWOT_BROWSE_SETTINGS_COOKIE_NAME = 'uwotBrowseSettings';

const getDefaultUwotBrowseOpts = function() {
	return {
		isGui: false
	};
};

const getDefaultUwotBrowseSettings = function() {
	return {
		showPanel: 'default',	//can be true, false, or default
		closeMsg: true,			//can be true, false, or unsigned number
		noHistory: false,		//can be true or false
		noCliHistory: false		//can be true or false 
	};
};

const UwotBrowseSettingsValidator = function(key, value) {
	var validKeys = Object.keys(getDefaultUwotBrowseSettings());
	if ('string' !== typeof key || -1 === validKeys.indexOf(key)) {
		return false;
	}
	const validators = {
		showPanel(val) {
			var vv = [
				'default',
				'true',
				'false'
			];
			if ('string' !== typeof val) {
				return vv;
			}
			return -1 !== vv.indexOf(val);
		},
		closeMsg(val) {
			if ('string' !== typeof val) {
				return [
					'true',
					'false',
					'number >= 0'
				];
			}
			else if ('true' === val || 'false' === val) {
				return true;
			}
			else if ('number' === typeof parseInt(val) && parseInt(val) >= 0) {
				return true;
			}
			else {
				return false;
			}
		},
		noHistory(val) {
			if ('string' !== typeof val) {
				return [
					'true',
					'false'
				];
			}
			return 'true' === val || 'false' === val;
		},
		noCliHistory(val) {
			if ('string' !== typeof val) {
				return [
					'true',
					'false'
				];
			}
			return 'true' === val || 'false' === val;
		}
	};
	return validators[key](value);
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
};

// class strictly for info/interface panel used during browse
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
		jQuery('#uwotoutput').append(getModalHtml());
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
		if (cliForms.length > 0) {
			cliForms.each((idx, el) => {
				let formId = jQuery(el).attr('id');
				let formElements = jQuery(el).find('input, select, textarea');
				formsContentHtml += '<div class="uwot-browse-modal-content-line" data-form-id="' + formId + '" data-form-num="' + idx + '"><span class="uwot-browse-modal-form-num">' + idx + '</span>&nbsp;<span class="uwot-browse-modal-form-id">' + formId + '</span>'
				if (formElements.length > 0) {
					let parentIdx = idx;
					formsContentHtml += '<ul class="uwot-browse-modal-content-ul">';
					let fieldHtmlMap = [];
					formElements.each((idx, el) => {
						let fieldType = jQuery(el).attr('type');
						if (fieldType !== 'submit' && fieldType !== 'hidden') {
							if ('string' !== typeof fieldType) {
								let fieldTag = jQuery(el).prop('tagName');
								switch(fieldTag) {
									case 'SELECT':
										if (jQuery(el).attr('multiple')){
											fieldType = 'multiselect';
										}
										else {
											fieldType = 'select';
										}
										break;
									case 'TEXTAREA':
										fieldType = 'textarea';
										break;
									default:
										fieldType = 'input';
								}
							}
							let fieldName = jQuery(el).attr('name');
							if (fieldType === 'radio') {
								let fieldNames = fieldHtmlMap.map((obj) => {
									return obj.name;
								});
								let nameIdx = fieldNames.indexOf(fieldName);
								let value = jQuery(el).val();
								if (-1 !== nameIdx) {
									let valueIdx = fieldHtmlMap[nameIdx].values.length;
									fieldHtmlMap[nameIdx].values.push('<li class="uwot-browse-modal-content-li" data-form-id="' + formId + '" data-form-num="' + parentIdx + '" data-field-num="' + nameIdx + '" data-field-name="' + fieldName + '" data-field-value-idx="' + valueIdx + '" data-field-value="' + value + '"><span class="uwot-browse-modal-form-field-value-num">' + valueIdx + '</span>&nbsp;<span class="uwot-browse-modal-form-field-value">' + value +'</span></li>');
									
								}
								else {
									fieldHtmlMap.push({
										name: fieldName,
										open: '<li class="uwot-browse-modal-content-li" data-form-id="' + formId + '" data-form-num="' + parentIdx + '" data-field-num="' + idx + '" data-field-name="' + fieldName + '" ' + 'data-field-type="' + fieldType + '"><span class="uwot-browse-modal-form-field-num">' + idx + '</span>&nbsp;<span class="uwot-browse-modal-form-field-name">',
										content: fieldName,
										close: '</li>',
										values: [
											'<li class="uwot-browse-modal-content-li" data-form-id="' + formId + '" data-form-num="' + parentIdx + '" data-field-num="' + idx + '" data-field-name="' + fieldName + '" data-field-value-idx="0" data-field-value="' + value + '"><span class="uwot-browse-modal-form-field-value-num">0</span>&nbsp;<span class="uwot-browse-modal-form-field-value">' + value +'</span></li>'
										]
									});
								}
							}
							else {
								let thisFieldObj = {
									name: fieldName,
									open: '<li class="uwot-browse-modal-content-li" data-form-id="' + formId + '" data-form-num="' + parentIdx + '" data-field-num="' + idx + '" data-field-name="' + fieldName + '" ' + 'data-field-type="' + fieldType + '">',
									content: '<span class="uwot-browse-modal-form-field-num">' + idx + '</span>&nbsp;<span class="uwot-browse-modal-form-field-name">' + fieldName + '</span>',
									close: '</li>'
								};
								if ('select' === fieldType || 'multiselect' === fieldType) {
									let fieldOptions = jQuery(el).find('option');
									if (fieldOptions.length > 0) {
										thisFieldObj.values = [];
										let thisFieldIdx = idx;
										fieldOptions.each((idx, el) => {
											let thisFieldValue = jQuery(el).val();
											thisFieldObj.values.push('<li class="uwot-browse-modal-content-li" data-form-id="' + formId + '" data-form-num="' + parentIdx + '" data-field-num="' + thisFieldIdx + '" data-field-name="' + fieldName + '" data-field-value-idx="' + idx + '" data-field-value="' + thisFieldValue + '"><span class="uwot-browse-modal-form-field-value-num">' + idx + '</span>&nbsp;<span class="uwot-browse-modal-form-field-value">' + thisFieldValue +'</span></li>')
										});
									}
								}
								fieldHtmlMap.push(thisFieldObj);
							}
						}
					});
					fieldHtmlMap.forEach((fieldObj) => {
						formsContentHtml += fieldObj.open;
						formsContentHtml += fieldObj.content;
						if ('object' === typeof fieldObj.values && Array.isArray(fieldObj.values) && fieldObj.values.length > 0) {
							formsContentHtml += '<ul class="uwot-browse-modal-content-ul">';
							formsContentHtml += fieldObj.values.join('');
							formsContentHtml += '</ul>';
						}
						formsContentHtml += fieldObj.close;
					});
					formsContentHtml += '</ul>'
				}
				formsContentHtml += '</div>';
			});
		}
		else {
			formsContentHtml += '<h4>No forms found.</h4>';
		}
		formsContentHtml += '</content></div>';
		return formsContentHtml;
	}
	getHistoryContent() {
		var formsContentHtml = '<div class="uwot-browse-modal-panel-content" data-panel-name="history"><title>History</title><content>';
		var histItems = uwotBrowseInstance.history.getAllItems();
		if (histItems.length < 1) {
			formsContentHtml += '<h4>No history found.</h4>';
		}
		else {
			for (let i = 0; i < histItems.length; i++) {
				formsContentHtml += '<div class="uwot-browse-modal-content-line" data-hist-cmd="' + histItems[i] + '" data-hist-num="' + i + '"><span class="uwot-browse-modal-hist-num">' + i + '</span>&nbsp;<span class="uwot-browse-modal-hist-name">' + histItems[i] + '</span></div>';
			}
		}
		formsContentHtml += '</content></div>';
		return formsContentHtml;
	}
	refreshAllContent(showOnRefresh) {
		showOnRefresh = 'boolean' === typeof showOnRefresh && true === showOnRefresh;
		var currentLinksContent = this.container.find('#uwotBrowseModalContent .uwot-browse-modal-panel-content[data-panel-name="links"]');
		var currentFormsContent = this.container.find('#uwotBrowseModalContent .uwot-browse-modal-panel-content[data-panel-name="forms"]');
		var currentHistoryContent = this.container.find('#uwotBrowseModalContent .uwot-browse-modal-panel-content[data-panel-name="history"]');
		if (currentLinksContent.length > 0) {
			this.container.find('#uwotBrowseModalContent .uwot-browse-modal-panel-content[data-panel-name="links"]').remove();
		}
		this.container.find('#uwotBrowseModalContent').append(this.getLinksContent());
		if (currentFormsContent.length > 0) {
			this.container.find('#uwotBrowseModalContent .uwot-browse-modal-panel-content[data-panel-name="forms"]').remove();
		}
		this.container.find('#uwotBrowseModalContent').append(this.getFormsContent());
		if (currentHistoryContent.length > 0) {
			this.container.find('#uwotBrowseModalContent .uwot-browse-modal-panel-content[data-panel-name="history"]').remove();
		}
		this.container.find('#uwotBrowseModalContent').append(this.getHistoryContent());
		if (null === this.currentPanel) {
			this.currentPanel = 'links';
		}
		this.setPanel(this.currentPanel);
		if (showOnRefresh) {
			this.show();
		}
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
		var $hist = this.container.find('#uwotBrowseModalContent [data-panel-name="history"] content .uwot-browse-modal-content-line[data-hist-num="' + histIdx + '"]');
		if ($hist.length < 1) {
			return '';
		}
		var histHref = $hist.attr('data-hist-cmd');
		histHref = 'string' === typeof histHref ? histHref : '';
		return histHref;
	}
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
		var self = this;
		var performBrowseOperations = function(reqData) {
			var oldCmd = reqData.cmd.trim();
			var oldCmdArr = oldCmd.split(' ');
			var noGo = false;
			var msg = ' "browse operation performed"';
			if (oldCmdArr[0] === 'clear') {
				msg = '';
				noGo = true;
				performOperations('clear');
			}
			else if (oldCmdArr[0] === 'opacity') {
				var setOpacity = self.modal.opacity(oldCmdArr[1]);
				noGo = true;
				msg = setOpacity ? ' "panel opacity: ' + oldCmdArr[1] + '%"' : ' "opacity must be a number in range 0-100"';
			}
			else if (oldCmdArr[0] === 'hide') {
				self.modal.hide();
				noGo = true;
				msg = ' "panel hidden"';
			}
			else if (oldCmdArr[0] === 'show') {
				var panelName;
				if ('string' === typeof oldCmdArr[1]) {
					panelName = oldCmdArr[1];
				}
				var setPanel = self.modal.show(panelName);
				noGo = true;
				msg = ' " panel';
				msg += setPanel ? ' ' + setPanel + ' shown"' : ' shown"';
			}
			else if (oldCmdArr[0] === 'set') {
				noGo = true;
				var validSettings = Object.keys(getDefaultUwotBrowseSettings());
				if ('string' !== typeof oldCmdArr[1]) {
					msg = ' "save a setting with the set command followed by a key and a value. valid keys: ' + validSettings.join() + '"';
				}
				else if ('string' !== typeof oldCmdArr[2] && validSettings.indexOf(oldCmdArr[1]) !== -1) {
					var currVal = self.getSetting(oldCmdArr[1]);
					msg = ' "valid values for setting ' + oldCmdArr[1] + ' are ' + UwotBrowseSettingsValidator(oldCmdArr[1]) + '. current value: ' + currVal + '"';
				}
				else {
					var setResult = self.saveSetting(oldCmdArr[1], oldCmdArr[2]);
					if (!setResult) {
						msg = ' "setting ' + oldCmdArr[1] + ' changed to ' + oldCmdArr[2] + '"';
					}
					else {
						msg = ' "' + setResult + '"';
					}
				}
			}
			if (noGo) {
				reqData.cmd = 'nogo ' + self.getReloadPath() + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui') + msg;
			}
			return reqData;
		};
		var changeLoadPath = function(reqData) {
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
					reqData.cmd = 'nogo ' + self.getReloadPath() + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui') + ' "invalid link index selected"';
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
			else if (oldCmdArr[0] === 'select' && oldCmdArr[1] === 'history') {
				var histIdx = parseInt(oldCmdArr[2]);
				var histHref = self.getHistHref(histIdx);
				if (Number.isNaN(histIdx)) {
					reqData.cmd = 'nogo ' + self.getReloadPath() + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui') + ' "invalid history index selected"';
				}
				else if ('string' !== typeof histHref || '' === histHref) {
					reqData.cmd = 'nogo ' + self.getReloadPath() + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui') + ' "history index selected has invalid target URI"';
				}
				else {
					reqData.cmd = 'go ' + histHref + ' ' + (uwotGetCookieValue('uwotBrowseCurrentType') === 'gui');
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
		};
		this.listener.addHook('beforePost', performBrowseOperations);
		this.listener.addHook('beforePost', changeLoadPath);
		this.modal = new UwotBrowseModal();
		// init settings
		if (this.getSetting('showPanel') === null) {
			this.resetSettings();
		}
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
		this.listener.removeHook('beforePost', 'performBrowseOperations');
		this.listener.removeHook('beforePost', 'changeLoadPath');
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
		var showPanel = false;
		var showPanelSetting = this.getSetting('showPanel');
		if ('object' === typeof opts && null !== opts) {
			this.isGui = 'boolean' === typeof opts.isGui && true === opts.isGui;
			isInitial = 'boolean' === typeof opts.isInitial && true === opts.isInitial;
			addToHistory = 'boolean' === typeof opts.addToHistory && true === opts.addToHistory;
			message = 'string' === typeof opts.msg ? opts.msg : message;
		}
		if ('true' === this.getSetting('noHistory')) {
			addToHistory = false;
		}
		if (!isInitial && addToHistory) {
			this.history.addItem(path);
		}
		if (this.isGui) {
			if (null === this.gui) {
				this.gui = new UwotGui();
			}
			this.gui.update(content);
			showPanel = showPanelSetting === 'true';
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
			showPanel = showPanelSetting === 'true' || showPanelSetting === 'default';
		}
		// generate modal content
		if (!this.modal.initialized) {
			this.modal.init(showPanel);
		}
		else {
			this.modal.refreshAllContent(showPanel);
		}
		if (message) {
			this.displayMsg(message);
		}
	}
	displayMsg(msg, msgClass) {
		var self = this;
		var selfClose = this.getSetting('closeMsg');
		var msgHtml = getMsgHtml(msg, msgClass);
		if (jQuery('#UwotBrowseMsg').length > 0) {
			jQuery('#UwotBrowseMsg').remove();
		}
		if ('string' === typeof msgHtml && '' !== msgHtml) {
			jQuery('#uwotoutput .output-container').prepend(msgHtml);
			return jQuery('#UwotBrowseMsg').fadeIn(400, function() {
				if (true === selfClose || 'true' === selfClose) {
					window.setTimeout(self.removeMsg, 5000);
				}
				if ('number' === typeof parseInt(selfClose) && 0 < parseInt(selfClose)) {
					window.setTimeout(self.removeMsg, parseInt(selfClose));
				}
			});
		}
		else {
			return false;
		}
	}
	removeMsg() {
		jQuery('#UwotBrowseMsg').fadeOut(400, function() {
			return jQuery('#UwotBrowseMsg').remove();
		});
	}
	getSetting(key) {
		var settingsObj, defaultSettings = getDefaultUwotBrowseSettings();
		var validKeys = Object.keys(defaultSettings);
		if ('string' !== typeof key || -1 === validKeys.indexOf(key)) {
			return 'invalid key';
		}
		var allSettings = uwotGetCookieValue(UWOT_BROWSE_SETTINGS_COOKIE_NAME);
		if ('string' === typeof allSettings && '' !== allSettings) {
			settingsObj = JSON.parse(allSettings);
			return settingsObj[key];
		}
		else {
			return null;
		}
	}
	saveSetting(key, value) {
		var settingsObj, defaultSettings = getDefaultUwotBrowseSettings();
		var validKeys = Object.keys(defaultSettings);
		if ('string' !== typeof key || -1 === validKeys.indexOf(key)) {
			return 'invalid key';
		}
		if (!UwotBrowseSettingsValidator(key, value)) {
			return 'invalid value';
		}
		var expiry = new Date().setFullYear(new Date().getFullYear() + 1);
		var currentVal = uwotGetCookieValue(UWOT_BROWSE_SETTINGS_COOKIE_NAME);
		if ('string' === typeof currentVal && '' !== currentVal) {
			settingsObj = JSON.parse(currentVal);
		}
		else {
			settingsObj = defaultSettings;
		}
		settingsObj[key] = value;
		var newVal = JSON.stringify(settingsObj);
		uwotSetCookie(UWOT_BROWSE_SETTINGS_COOKIE_NAME, newVal, expiry);
		return false;
	}
	resetSettings() {
		var expiry = new Date().setFullYear(new Date().getFullYear() + 1);
		var defaultSettings = getDefaultUwotBrowseSettings();
		var val = JSON.stringify(defaultSettings);
		uwotSetCookie(UWOT_BROWSE_SETTINGS_COOKIE_NAME, val, expiry);
		return false;
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
	getHistHref(idx) {
		var histHref = this.modal.selectHistory(idx);
		return histHref;
	}
}
