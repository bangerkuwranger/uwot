'use strict';
const url = require('url');
const path = require('path');
const EOL = require('os').EOL;
const request = require('request-promise-native');
const cheerio = require('cheerio');
const css = require('css');
const nodeCache = require('node-cache');
var cache = new nodeCache({ stdTTL: 3600 });

// converts standard html output into graphic console html, which maintains interface continuity

module.exports = {
	
	cache,
	
	// reads html into cheerio for jQuery-like conversion
	getAsJQuery(htmlString) {
	
		if ('string' !== typeof htmlString) {
		
			throw new TypeError('invalid htmlString passed to getAsJQuery');
		
		}
		else {
		
			let $ = cheerio.load(htmlString);
			return $;
		
		}
	
	},
	
	// all external links with internal targets written to calls to console.js methods
	makeConsoleHtml(jqObj) {
	
		if ('function' !== typeof jqObj) {
		
			throw new TypeError('invalid jqObj passed to makeConsoleHtml');
		
		}
		else {
		
			var linkCount = jqObj('body a').length;
			if (linkCount > 0) {
			
				jqObj('body a').each(function(i, thisLink) {
			
					var thisLinkTarget = jqObj(thisLink).attr('target');
					var thisLinkOnclick = jqObj(thisLink).attr('onclick');
					jqObj(thisLink).addClass('uwot-console-link');
					jqObj(thisLink).wrap('<span class="uwot-console-link-wrap"</div>');
					jqObj(thisLink).attr('data-link-num', i);
					if ('string' !== typeof thisLinkOnclick && ('string' !== typeof thisLinkTarget || '_blank' !== thisLinkTarget)) {
					
						jqObj(thisLink).attr('onclick', 'uwotConsoleGoto("' + jqObj(thisLink).attr('href') + '")');
					
					}
			
				});
				return jqObj('body').html();
			
			}
			else {
			
				return jqObj('body').html();
			
			}
		
		}
	
	},
	
	// retrieves external resources and concatenates into a string; returns a Promise
	getRemoteResources(urlOrUrlArray, contentString, type) {
	
		var self = this;
		var cached = false;
		if ('string' !== typeof type || ('style' !== type && 'script' !== type)) {
		
			type = 'file';
		
		}
		return new Promise((resolve, reject) => {
		
			if ('string' === typeof urlOrUrlArray) {
			
				cached = cache.get(urlOrUrlArray);
				if (!cached) {

					return request.get(urlOrUrlArray).then((body) => {
			
						if (type === 'style') {
					
							self.localizeCss(body, urlOrUrlArray).then((localizedCss) => {
						
								localizedCss = "/***  " + urlOrUrlArray + "  ***/" + EOL + localizedCss;
								cache.set(urlOrUrlArray, localizedCss);
								if ('string' !== typeof contentString || '' === contentString) {
	
									return resolve(localizedCss);
	
								}
								else {
		
									return resolve(contentString + localizedCss);
		
								}
						
							});
					
						}
						else {
					
							if ('script' === type) {
						
								body = "/***  " + urlOrUrlArray + "  ***/" + EOL + body;
						
							}
							cache.set(urlOrUrlArray, body);
							if ('string' !== typeof contentString || '' === contentString) {
	
								return resolve(body);
	
							}
							else {
		
								return resolve(contentString + body);
		
							}
					
						}
			
					}).catch((error) => {
				
						return process.nextTick(reject, error);
			
					});
		
				}
				else if ('string' !== typeof contentString || '' === contentString) {

					return process.nextTick(resolve, cached);

				}
				else {

					return process.nextTick(resolve, contentString + cached);

				}
	
			}
			else if ('object' === typeof urlOrUrlArray && Array.isArray(urlOrUrlArray)) {
	
				var currentUrl = urlOrUrlArray.shift();
				if (!currentUrl && 'string' !== typeof contentString) {
		
					return process.nextTick(reject, new Error('no content received'));
		
				}
				else if (!currentUrl) {
		
					return resolve(contentString);
		
				}
				else {
		
					cached = cache.get(currentUrl);
					if (!cached) {
			
						return request.get(currentUrl).then((body) => {
			
							if (type === 'style') {
					
								self.localizeCss(body, currentUrl).then((localizedCss) => {
							
									localizedCss = "/***  " + currentUrl + "  ***/" + EOL + localizedCss;
									cache.set(currentUrl, localizedCss);
									if ('string' !== typeof contentString) {
	
										contentString = localizedCss;
	
									}
									else {
		
										contentString += localizedCss;
		
									}
									return self.getRemoteResources(urlOrUrlArray, contentString, type).then((content) => {
					
										return resolve(content);
					
									}).catch((error) => {
					
										return process.nextTick(reject, error);
					
									});
							
								});
				
							}
							else {
						
								if ('script' === type) {
						
									body = "/***  " + currentUrl + "  ***/" + EOL + body;
						
								}
								cache.set(currentUrl, body);
								if ('string' !== typeof contentString) {
	
									contentString = body;
	
								}
								else {
		
									contentString += body;
		
								}
								return self.getRemoteResources(urlOrUrlArray, contentString, type).then((content) => {
					
									resolve(content);
					
								}).catch((error) => {
					
									return process.nextTick(reject, error);
					
								});
						
							}
				
						}).catch((error) => {
				
							return process.nextTick(reject, error);
				
						});
			
					}
					else {
			
						contentString = 'string' !== typeof contentString || '' === contentString ? cached : contentString + cached;
						return self.getRemoteResources(urlOrUrlArray, contentString).then((content) => {
				
							return resolve(content);
				
						}).catch((error) => {
				
							return process.nextTick(reject, error);
				
						});
			
					}
		
				}
	
			}
			else {
	
				return process.nextTick(reject, new TypeError('urlOrUrlArray must be a string or an Array of strings'));
	
			}
		
		});
	
	},
	
	// pulls head elements and loads from cache or remote location if needed
	pullHeadElements(jqObj, type) {
	
		var self = this;
		return new Promise((resolve, reject) => {
			if ('function' !== typeof jqObj) {
		
				return process.nextTick(reject, new TypeError('invalid jqObj passed to pullHeadElements'));
		
			}
			else {
		
				var headElements, closeTag, headContent = '';
				if ('string' !== typeof type || 'script' !== type) {
			
					type = 'style';
					headElements = jqObj('head > link');
					headContent += '<style type="text/css">';
					closeTag = '</style>';
			
				}
				else {
			
					headElements = jqObj('head > script');
					headContent += '<script type="text/javascript">';
					closeTag = '</script>';
			
				}
				var urlArray = [];
				var elementCount = headElements.length;
				if (elementCount > 0) {
			
					headElements.each(function(i, thisEl) {
		
						var thisUri, parsedUri;
						if (type === 'style' && jqObj(thisEl).attr('rel') === 'stylesheet' && 'string' === typeof jqObj(thisEl).attr('href') && '' !== jqObj(thisEl).attr('href')) {
			
							thisUri = jqObj(thisEl).attr('href');
							parsedUri =  url.parse(thisUri, false, true);
							if ('string' !== typeof parsedUri.protocol) {
							
								thisUri = global.Uwot.Config.getVal('server', 'transport') + ':' + thisUri;
							
							}
							urlArray.push(thisUri);
			
						}
						else if (type === 'script' && jqObj(thisEl).attr('type') === 'text/javascript' && 'string' === typeof jqObj(thisEl).attr('src') && '' !== jqObj(thisEl).attr('src') && -1 === jqObj(thisEl).attr('src').indexOf('jquery.min.js')) {
					
							thisUri = jqObj(thisEl).attr('src');
							parsedUri =  url.parse(thisUri, false, true);
							if ('string' !== typeof parsedUri.protocol) {
							
								thisUri = global.Uwot.Config.getVal('server', 'transport') + ':' + thisUri;
							
							}
							urlArray.push(thisUri);
					
						}
						if ((i + 1) >= elementCount) {
				
							self.getRemoteResources(urlArray, '', type).then((cnt) => {
						
								headContent += cnt + closeTag;
								return resolve(headContent);
						
							}).catch((err) => {
						
								return process.nextTick(reject, err);
						
							});
				
						}
		
					});
			
				}
				else {
			
					headContent = '';
					return process.nextTick(resolve, headContent);
			
				}
			
			}
		
		});
	
	},
	
	loadForConsole(htmlString, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to loadForConsole');
		
		}
		else if ('string' !== typeof htmlString) {
		
			return process.nextTick(callback, new TypeError('invalid htmlString passed to loadForConsole'), null);
		
		}
		else {
		
			var self = this;
			try {

				var $ = self.getAsJQuery(htmlString);
				var applicationName = $('head meta[name=application-name]').attr('content');
				applicationName = 'string' === typeof applicationName && 'uwotcli' === applicationName.toLowerCase() ? 'uwotCli' : 'uwotGui';
				var bodyHtml = self.makeConsoleHtml($);
				var finalHtml = '<div id="uwotBrowseHtml" class="' + applicationName + '-html">';
				Promise.all([
					self.pullHeadElements($, 'style'),
					self.pullHeadElements($, 'script')
				]).then((contentArray) => {
					
					if('string' === typeof contentArray[0]) {
					
						finalHtml += contentArray[0];
					
					}
					if('string' === typeof contentArray[1]) {
					
						finalHtml += contentArray[1];
					
					}
					finalHtml += bodyHtml + '</div>';
					return callback(false, finalHtml);
					
				}).catch((error) => {
				
					return process.nextTick(callback, error, bodyHtml);
				
				});

			}
			catch(e) {
			
				return process.nextTick(callback, e, null);
			
			}		

		}
	
	},
	
	localizeCss(cssString, cssUri) {
	
		return new Promise((resolve) => {
		
			if ('string' !== typeof cssString || '' === cssString) {
		
				return process.nextTick(resolve, cssString);
		
			}
			else {
		
				var cssObj, cssUrl, cssPath, baseUrl = null;
				try {
			
					cssObj = css.parse(cssString);
			
				}
				catch(e) {
			
					return process.nextTick(resolve, cssString);
			
				}
				if ('string' === typeof cssUri && '' !== cssUri) {
			
					try {
				
						cssUrl =  url.parse(cssUri, false, true);
				
					}
					catch(e) {
				
						return process.nextTick(resolve, cssString);
				
					}
			
				}
				else {
			
					cssUrl = null;
			
				}
				if ('object' === typeof cssUrl && null !== cssUrl) {
			
					baseUrl = cssUrl.protocol + '//' + cssUrl.hostname;
					cssPath = '/' !== cssUrl.pathname && '' !== cssUrl.pathname ? path.dirname(cssUrl.pathname) + '/' : '/';
			
				}
				for (let i = 0; i < cssObj.stylesheet.rules.length; i++) {
			
					if ('object' === typeof cssObj.stylesheet.rules[i].selectors && Array.isArray(cssObj.stylesheet.rules[i].selectors)) {
				
						cssObj.stylesheet.rules[i].selectors.forEach((selectStr, idx) => {
				
							if (selectStr.indexOf('body') !== -1) {
					
								cssObj.stylesheet.rules[i].selectors[idx] = selectStr.replace('body', '#uwotBrowseHtml');
					
							}
							else {
					
								cssObj.stylesheet.rules[i].selectors[idx] = '#uwotBrowseHtml ' + selectStr;
					
							}
				
						});
				
					}
					if ('object' === typeof cssObj.stylesheet.rules[i].declarations && Array.isArray(cssObj.stylesheet.rules[i].declarations)) {
				
						cssObj.stylesheet.rules[i].declarations.forEach((declaration, idx) => {
				
							if ('string' === typeof declaration.value && '' !== declaration.value && declaration.value.indexOf('url(') !== -1) {
					
								var thisUrl;
								if (declaration.value.indexOf('url(\'') !== -1 || declaration.value.indexOf('url("') !== -1) {
								
									thisUrl = declaration.value.replace(/(url\W*\(\W*['"])(.*?)(\W*['"]?\W*\))/g, '$2');
								
								}
								else {
								
									thisUrl = declaration.value.replace(/url\(([^)'"]+)\)/g, '$1');
								
								}
								var thisParsedUrl = url.parse(thisUrl);
								if (thisParsedUrl.protocol === null && thisParsedUrl.host === null && baseUrl !== null) {
						
									cssObj.stylesheet.rules[i].declarations[idx].value = "url('" + url.resolve(baseUrl + cssPath, thisUrl) + "')";
						
								}
								else if (thisParsedUrl.protocol === null & thisParsedUrl.host !== null) {
						
									cssObj.stylesheet.rules[i].declarations[idx].value = "url('" + global.Uwot.Config.getVal('server', 'transport') + ':' + thisParsedUrl.href + "')";
						
								}
					
							}
				
						});
				
					}
					if ((i + 1) >= cssObj.stylesheet.rules.length) {
				
						return process.nextTick(resolve, css.stringify(cssObj));
				
					}
			
				}
			
		
			}
		
		});
	
	}

};
