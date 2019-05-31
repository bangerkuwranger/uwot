'use strict';
const request = require('request-promise-native');
const cheerio = require('cheerio');
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
		
			var linkCount = jqObj('a').length;
			if (linkCount > 0) {
			
				jqObj('a').each(function(i, thisLink) {
			
					var thisLinkTarget = jqObj(thisLink).attr('target');
					var thisLinkOnclick = jqObj(thisLink).attr('onclick');
					if ('string' !== typeof thisLinkOnclick && ('string' !== typeof thisLinkTarget || '_blank' !== thisLinkTarget)) {
					
						jqObj(thisLink).attr('onclick', 'uwotConsoleGoto("' + jqObj(thisLink).attr('href') + '")');
						jqObj(thisLink).addClass('uwot-console-link');
					
					}
			
				});
				return jqObj.html();
			
			}
			else {
			
				return jqObj.html();
			
			}
		
		}
	
	},
	
	// retrieves external resources and concatenates into a string; returns a Promise
	getRemoteResources(urlOrUrlArray, contentString) {
	
		var self = this;
		if ('string' === typeof urlOrUrlArray) {
	
			return new Promise(function(resolve, reject) {
		
				var cached = cache.get(urlOrUrlArray);
				if (!cached) {
	
					return request.get(urlOrUrlArray).then((body) => {
				
						cache.set(urlOrUrlArray, body);
						if (!contentString) {
		
							resolve(body);
		
						}
						else {
			
							resolve(contentString + body);
			
						}
				
					}).catch((error) => {
				
						reject(error);
				
					});
			
				}
				else if (!contentString) {

					resolve(cached);

				}
				else {
	
					resolve(contentString + cached);
	
				}
	
			});
	
		}
		else if ('object' === typeof urlOrUrlArray && Array.isArray(urlOrUrlArray)) {
	
			var currentUrl = urlOrUrlArray.shift();
			if (!currentUrl && 'string' !== typeof contentString) {
		
				return Promise.reject(new Error('no content received'));
		
			}
			else if (!currentUrl) {
		
				return Promise.resolve(contentString);
		
			}
			else {
		
				return new Promise(function(resolve, reject) {
	
					var cached = cache.get(currentUrl);
					if (!cached) {
				
						return request.get(currentUrl).then((body) => {
				
							cache.set(currentUrl, body);
							if (!contentString) {
		
								contentString = body;
		
							}
							else {
			
								contentString += body;
			
							}
							return self.getRemoteResources(urlOrUrlArray, contentString).then((content) => {
						
								resolve(content);
						
							}).catch((error) => {
						
								reject(error);
						
							});
					
						}).catch((error) => {
					
							reject(error);
					
						});
				
					}
					else {
				
						contentString = contentString ? contentString + cached : cached;
						return self.getRemoteResources(urlOrUrlArray, contentString).then((content) => {
					
							resolve(content);
					
						}).catch((error) => {
					
							reject(error);
					
						});
				
					}
	
				});
		
			}
	
		}
		else {
	
			return Promise.reject(new TypeError('urlOrUrlArray must be a string or an Array of strings'));
	
		}
	
	},
	
	// pulls head elements and loads from cache or remote location if needed
	pullHeadElements(jqObj, type) {
	
		var self = this;
		if ('function' !== typeof jqObj) {
		
			return Promise.reject(TypeError('invalid jqObj passed to pullHeadElements'));
		
		}
		else {
		
			return new Promise((resolve, reject) => {
			
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
		
						if (type === 'style' && jqObj(thisEl).attr('rel') === 'stylesheet' && 'string' === typeof jqObj(thisEl).attr('href') && '' !== jqObj(thisEl).attr('href')) {
			
							urlArray.push(jqObj(thisEl).attr('href'));
			
						}
						else if (type === 'script' && jqObj(thisEl).attr('type') === 'text/javascript' && 'string' === typeof jqObj(thisEl).attr('src') && '' !== jqObj(thisEl).attr('src') && -1 === jqObj(thisEl).attr('src').indexOf('jquery.min.js')) {
					
							urlArray.push(jqObj(thisEl).attr('src'));
					
						}
						if ((i + 1) >= elementCount) {
				
							self.getRemoteResources(urlArray).then((cnt) => {
						
								headContent += cnt + closeTag;
								resolve(headContent);
						
							}).catch((err) => {
						
								reject(err);
						
							});
				
						}
		
					});
			
				}
				else {
			
					headContent = '';
					resolve(headContent);
			
				}
			
			});
		
		}
	
	},
	
	loadForConsole(htmlString, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to loadForConsole');
		
		}
		else if ('string' !== typeof htmlString) {
		
			return callback(TypeError('invalid htmlString passed to loadForConsole'), null);
		
		}
		else {
		
			var self = this;
			try {

				var $ = self.getAsJQuery(htmlString);
				var bodyHtml = self.makeConsoleHtml($('body'));
				var finalHtml = '';
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
					finalHtml += bodyHtml;
					return callback(false, finalHtml);
					
				}).catch((error) => {
				
					return callback(error, bodyHtml);
				
				});

			}
			catch(e) {
			
				return callback(e, null);
			
			}		

		}
	
	}

};
