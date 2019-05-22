'use strict';
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

// converts standard html output into graphic console html, which maintains interface continuity

module.exports = {

	
	// reads html into cheerio for jQuery-like conversion
	getAsJQuery(htmlString) { },
	
	// all external links with internal targets written to calls to console.js methods
	makeConsoleHtml(jqObj) { },
	
	// pulls head elements and loads from cache or remote location if needed
	pullHeadElements(jqObj) { },
	
	// returns string with html code from inside body element of a jqObj
	getBodyHtml(jqObj) { }

}

