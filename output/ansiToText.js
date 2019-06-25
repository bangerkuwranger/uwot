/**
 * Definitions of object->"ANSI" display html
 *
 * prop: (string)tag -> html: tag name
 * prop: (string)color -> html: class "fg-[colorName]"
 * prop: (string)backgroundColor -> html: class "bg-[colorName]"
 * prop: (bool)isReversed -> html: class "reversed"
 * prop: (bool)isBold -> html: class "bold"
 * prop: (bool)isUnderline -> html: class "underline"
 * prop: (array)classes -> html: each element escaped and added to classes for tag
 * prop: (array)content -> strings & hierarchical objects in order
 */

const cheerio = require('cheerio');
const EOL = require('os').EOL;
const toHtml = require('./ansi');

const getValidInputTypes = function() {

	return [
		'object',
		'string',
		'json',
		'html'
	];

};
const getCRElementTags = function() {

	return [
		'address',
		'article',
		'aside',
		'blockquote',
		'br',
		'canvas',
		'dd',
		'div',
		'dl',
		'dt',
		'fieldset',
		'figcaption',
		'figure',
		'footer',
		'form',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'header',
		'hr',
		'li',
		'main',
		'nav',
		'noscript',
		'ol',
		'p',
		'pre',
		'section',
		'table',
		'thead',
		'tr',
		'tfoot',
		'ul',
		'video'
	];

};

function ansiHtmlToText(htmlText) {

	var $ = cheerio.load(htmlText);
	var textString = '';
	var $all = $('html > body *');
	var elCount = $($all).length;
	$($all).each(function(i, element) {
	
		var thisText = $(element).first().contents().filter(function() {
			return this.type === 'text';
		}).text();
		if (-1 !== getCRElementTags().indexOf($(element).prop('tagName').toLowerCase()) && 'string' === typeof thisText && '' !== thisText) {
		
			var nextEl = $($all).eq(i + 1);
			textString += EOL + thisText;
			if ((i + 1) < elCount && -1 === getCRElementTags().indexOf($(nextEl).prop('tagName').toLowerCase())) {
			
				textString += EOL;
			
			}
		
		}
		else if ('string' === typeof thisText && '' !== thisText) {
		
			textString += thisText;
		
		}
		else if ('br' === element.name.toLowerCase()) {
		
			textString += EOL;
		
		}
	
	});
	return textString;

}

// TBD
// This needs some work; recursion is having trouble with nesting...
function parseToText(inputValue, inputType) {

	if ('string' !== typeof inputType || -1 === getValidInputTypes().indexOf(inputType)) {
	
		return inputValue.toString();
	
	}
	else if ('string' === inputType) {
	
		return inputValue;
	
	}
	else if ('html' === inputType) {
	
		return module.exports.ansiHtmlToText(inputValue);
	
	}
	else {
	
		var ansiObj = inputValue;
		if ('json' === inputType && 'string' === typeof inputValue) {
	
			ansiObj = global.Uwot.Constants.tryParseJSON(inputValue);
			ansiObj = !ansiObj ? inputValue : ansiObj;
			if ('object' === typeof ansiObj && 'object' === typeof ansiObj.output) {
	
				ansiObj = ansiObj.output;
			
			}
	
		}	
		if ('object' === typeof ansiObj && 'object' !== typeof ansiObj.output) {

			ansiObj = {
				output: ansiObj
			};
		
		}
		var htmlString = toHtml(ansiObj).output;
		return module.exports.ansiHtmlToText(htmlString);
	
	}

}

module.exports = parseToText;
Object.defineProperty(module.exports, 'ansiHtmlToText', {
	writable: true,
	value: ansiHtmlToText
});
