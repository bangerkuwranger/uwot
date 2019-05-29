'use strict';
const fs = require('fs-extra');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
var cache = new NodeCache({ stdTTL: 3600 });

function getRemoteResource(url, callback) {

	if ('function' !== typeof callback) {
	
		throw new TypeError('invalid callback passed to getRemoteResource');
	
	}
	else {
	
		request(url, function(error, response, body) {
		
			if (error) {
			
				return callback(error, response);
			
			}
			else if (response.statusCode != 200) {
			
				return callback(response, null);
			
			}
			else {
			
				return callback(false, body);
			
			}
		
		});
	
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
		
			var allLinks = jqObj('a');
			var linkCount = allLinks.length;
			if (linkCount > 0) {
			
				allLinks.each(function(i, thisLink) {
			
					var thisLinkTarget = thisLink.attr('target');
					var thisLinkOnClick = thisLink.attr('onClick');
					if ('string' !== typeof thisLinkOnClick && ('string' !== typeof thisLinkTarget || '_blank' !== thisLinkTarget)) {
					
						thisLink.attr('onClick', 'uwotConsoleGoto(' + thisLink.attr('href') + ')');
					
					}
					if (i >= linkCount) {
					
						return jqObj.html();
					
					}
			
				});
			
			}
			else {
			
				return jqObj.html();
			
			}
		
		}
	
	},
	
	// pulls head elements and loads from cache or remote location if needed
	pullHeadElements(jqObj, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to pullHeadElements');
		
		}
		else if ('function' !== typeof jqObj) {
		
			return callback(TypeError('invalid jqObj passed to pullHeadElements'), null);
		
		}
		else {
		
			var headLinks = jqObj('head > link');
			var headScripts = jqObj('head > script');
			var headContent = {
				scripts: '<script type="text/javascript">',
				styles: '<style type="text/css">'
			};
			var linkCount = headLinks.length;
			var scriptCount = headScripts.length;
			var stylesDone = false;
			var scriptsDone = false;
			while (!stylesDone && !scriptsDone) {
			
				if (linkCount > 0) {
				
					headLinks.each(function(i, thisLink) {
			
						if (thisLink.attr('rel') === 'stylesheet' && 'string' === typeof thisLink.attr('href') && '' !== thisLink.attr('href')) {
				
							var thisUrl = thisLink.attr('href');
							var thisContent = cache.get(thisUrl);
							if (!thisContent) {
					
								getRemoteResource(thisUrl, function(error, response){
								
									if (!error) {
									
										cache.set(thisUrl, response);
										headContent.styles += response;
									
									}
									if (i >= linkCount) {
								
										headContent.styles += '</style>';
										stylesDone = true;
								
									}
						
								});
					
							}
							else {
					
								headContent.styles += thisContent;
								if (i >= linkCount) {
								
									headContent.styles += '</style>';
									stylesDone = true;
								
								}
					
							}
				
						}
						else if (i >= linkCount) {
					
							headContent.styles += '</style>';
							stylesDone = true;
					
						}
			
					});
				
				}
				else {
				
					headContent.styles = '';
					stylesDone = true;
				
				}
				if (scriptCount > 0) {
				
					headScripts.each(function(i, thisScript) {
			
						if (thisScript.attr('type') === 'text/javascript' && 'string' === typeof thisScript.attr('src') && '' !== thisScript.attr('src') && -1 === thisScript.attr('src').indexOf('jquery.min.js')) {
				
							var thisUrl = thisScript.attr('src');
							var thisContent = cache.get(thisUrl);
							if (!thisContent) {
					
								getRemoteResource(thisUrl, function(error, response){
								
									if (!error) {
									
										cache.set(thisUrl, response);
										headContent.scripts += response;
									
									}
									if (i >= scriptCount) {
								
										headContent.scripts += '</script>';
										scriptsDone = true;
								
									}
						
								});
					
							}
							else {
					
								headContent.scripts += thisContent;
								if (i >= scriptCount) {
								
									headContent.scripts += '</script>';
									scriptsDone = true;
								
								}
					
							}
				
						}
						else if (i >= scriptCount) {
					
							headContent.scripts += '</style>';
							scriptsDone = true;
					
						}
			
					});
				
				}
				else {
				
					headContent.scripts = '';
					scriptsDone = true;
				
				}
			
			}
			return callback(false, headContent);
		
		}
	
	},
	
	// returns string with html code from inside body element of a jqObj
	getBodyHtml(jqObj) {
	
		if ('function' !== typeof jqObj) {
		
			throw new TypeError('invalid jqObj passed to getBodyHtml');
		
		}
		else {
		
			return jqObj('body').html();
		
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
				self.pullHeadElements($, function(error, headContent) {
			
					if (error) {
				
						return callback(error, bodyHtml);
				
					}
					else {
				
						var finalHtml = '';
						if ('string' === typeof headContent.styles && headContent.styles !== '') {
					
							finalHtml += headContent.styles;
					
						}
						if ('string' === typeof headContent.scripts && headContent.scripts !== '') {
					
							finalHtml += headContent.scripts;
					
						}
						finalHtml += bodyHtml;
						return callback(false, finalHtml);
				
					}
			
				});

			}
			catch(e) {
			
				return callback(e, null);
			
			}		

		}
	
	}

};
