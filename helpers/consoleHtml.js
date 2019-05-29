'use strict';
const fs = require('fs-extra');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const nodeCache = require('node-cache');
var cache = new nodeCache({ stdTTL: 3600 });

function getRemoteResources(urlOrUrlArray, contentString) {
	
	if ('string' === typeof urlOrUrlArray) {
	
		return new Promise(function(resolve, reject) {
		
			var cached = cache.get(urlOrUrlArray);
			if (!cached) {
	
				request(urlOrUrlArray, function(error, response, body) {
		
					if (error) {
			
						reject(error);
			
					}
					else if (response.statusCode != 200) {
			
						reject(response);
			
					}
					else {
				
						cache.set(urlOrUrlArray, body);
						if (!contentString) {
			
							resolve(body);
			
						}
						else {
				
							resolve(contentString + body);
				
						}
				
					}
		
				});
			
			}
			else {
			
				resolve(cached);
			
			}
	
		});
	
	}
	else if ('object' === typeof urlOrUrlArray && Array.isArray(urlOrUrlArray)) {
	
		var currentUrl = urlOrUrlArray.shift();
		if (!currentUrl && !contentString) {
		
			return Promise.reject(new Error('no content received'))
		
		}
		else if (!currentUrl) {
		
			return Promise.resolve(contentString);
		
		}
		else {
		
			return new Promise(function(resolve, reject) {
	
				var cached = cache.get(currentUrl);
				if (!cached) {
				
					request(currentUrl, function(error, response, body) {
				
						if (error) {
			
							reject(error);
			
						}
						else if (response.statusCode != 200) {
			
							reject(response);
			
						}
						else  {
				
							cache.set(currentUrl, body);
							if (!contentString) {
			
								contentString = body;
			
							}
							else {
				
								contentString += body;
				
							}
							resolve(function() {
								
								return getRemoteResources(urlOrUrlArray, contentString);
							
							});
					
						}
		
					});
				
				}
				else {
				
					contentString = contentString ? contentString + cached : cached;
					resolve(function() {
					
						return getRemoteResources(urlOrUrlArray, contentString);
				
					});
				
				}
	
			});
		
		}
	
	}
	else {
	
		return Promise.reject(new TypeError('urlOrUrlArray must be a string or an Array of strings'));
	
	}
	
}

// converts standard html output into graphic console html, which maintains interface continuity

module.exports = {
	
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
	
	// pulls head elements and loads from cache or remote location if needed
	pullHeadElements(jqObj, type, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to pullHeadElements');
		
		}
		else if ('function' !== typeof jqObj) {
		
			return callback(TypeError('invalid jqObj passed to pullHeadElements'), null);
		
		}
		else {
		
			var headElements, closeTag, headContent = '';
			if ('string' !== typeof type || 'script' !== type) {
			
				type === 'style';
				headElements = jqObj('head > link');
				headContent += '<style type="text/css">';
				closeTag = '</style>';
			
			}
			else {
			
				headElements = jqObj('head > script');
				headContent += '<script type="text/javascript>"';
				closeTag = '</script>';
			
			}
			var urlArray = [];
			var elementCount = headElements.length;
			if (elementCount > 0) {
			
				headElements.each(function(i, thisEl) {
		
					if (type === 'style' &&jqObj(thisEl).attr('rel') === 'stylesheet' && 'string' === typeof jqObj(thisEl).attr('href') && '' !== jqObj(thisEl).attr('href')) {
			
						urlArray.push(jqObj(thisLink).attr('href'));
			
					}
					else if (type === 'script' && jqObj(thisScript).attr('type') === 'text/javascript' && 'string' === typeof jqObj(thisScript).attr('src') && '' !== jqObj(thisScript).attr('src') && -1 === jqObj(thisScript).attr('src').indexOf('jquery.min.js')) {
					
						urlArray.push(jqObj(thisScript).attr('src'));
					
					}
					if ((i + 1) >= elementCount) {
				
						getRemoteResources(urlArray).then((cnt) => {
						
							headContent += cnt + closeTag;
							return callback(false, headContent);
						
						}).catch((err) => {
						
							return callback(err, null);
						
						});
				
					}
		
				});
			
			}
			else {
			
				headContent = '';
				return callback(false, headContent);
			
			}
		
		}
	
	},
	
	loadForConsole(htmlString, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to loadForConsole');
		
		}
		else if ('string' !== typeof htmlString) {
		
			return callback(TypeError('invalid jqObj passed to loadForConsole'), null);
		
		}
		else {
		
			var self = this;
			try {

				var $ = self.getAsJQuery(htmlString);
				var bodyHtml = self.makeConsoleHtml($('body'));
				self.pullHeadElements($, 'style').then((styles) => {
			
					var finalHtml = '';
					if ('string' === typeof styles && styles !== '') {
				
						finalHtml += headContent.styles;
				
					}
					finalHtml += bodyHtml;
					return callback(false, finalHtml);
					
				}).catch((error) =>
				
					return callback(error, bodyHtml);
				
				});

			}
			catch(e) {
			
				return callback(e, null);
			
			}		

		}
	
	}

};
