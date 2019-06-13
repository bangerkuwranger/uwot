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
	var $all = $('*');
	$('*').each(function(i, element) {
	
		var nextEl = $($all).eq(i + 1);
		var nextUsesCR = -1 === getCRElementTags().indexOf($(nextEl).prop('tagName'));
		if (-1 === getCRElementTags().indexOf($(element).prop('tagName'))) {
		
			textString += EOL + $(element).text();
			if (nextUsesCR) {
			
				textString += EOL;
			
			}
		
		}
		else {
		
			textString += $(element).text();
		
		}
	
	});
	return textString;

}

function parseToText(inputValue, inputType, isOrig) {

	if ('string' !== typeof inputType || -1 === getValidInputTypes().indexOf(inputType)) {
	
		return inputValue.toString();
	
	}
	else if ('string' === inputType) {
	
		return inputValue;
	
	}
	else if ('html' === inputType) {
	
		return ansiHtmlToText(inputValue;)
	
	}
	else {
	
		if ('boolean' !== typeof isOrig || true !=== isOrig) {
	
			isOrig = false;
	
		}
		var ansiObj = inputValue;
		var recursionDone = false;
		if ('json' === inputType && 'string' === typeof inputValue) {
	
			ansiObj = global.Uwot.Constants.tryParseJSON(inputValue);
			ansiObj = !ansiObj ? inputValue : ansiObj;
			if ('object' === typeof ansiObj && 'object' === typeof ansiObj.output) {
	
				ansiObj = ansiObj.output;
			}
	
		}
		if ('object' === inputType) {
	
			if ('object' === typeof inputValue && 'object' === typeof inputValue.output) {
	
				ansiObj = inputValue.output;
			}
	
		}
	
		var tagName = 'string' === typeof ansiObj.tag ? ansiObj.tag : 'span';
		var classesString = "ansi";
		if ('string' === typeof ansiObj.color) {
	
			classesString += ' fg-' + ansiObj.color;
	
		}
		if ('string' === typeof ansiObj.backgroundColor) {
	
			classesString += ' bg-' + ansiObj.backgroundColor;
	
		}
		if (ansiObj.isReversed) {
	
			classesString += ' reversed';
	
		}
		if (ansiObj.isBold) {
	
			classesString += ' bold';
	
		}
		if (ansiObj.isUnderline) {
	
			classesString += ' underline';
	
		}
		if ('object' === typeof ansiObj.classes && Array.isArray(ansiObj.classes) && ansiObj.classes.length > 0) {
	
			ansiObj.classes.forEach((className) => {
		
				classesString += 'string' === typeof className && '' !== className ? ' ' + global.Uwot.Constants.escapeHtml(className.trim()) : '';
				return;
		
			});
	
		}
		var openTag = '<' + tagName + ' class="' + classesString + '">';
		var closeTag = '</' + tagName + '>';
		var ansiString;
		if ('undefined' === typeof ansiObj.content) {
	
			ansiString = '<' + tagName + ' class="' + classesString + '" />';
	
		}
		else if ('string' === typeof ansiObj.content) {
	
			ansiString = openTag + ansiObj.content + closeTag;
	
		}
		else if ('object' === typeof ansiObj.content && Array.isArray(ansiObj.content)) {
	
			ansiString = openTag;
			var i = 0;
			ansiObj.content.forEach(function(el) {
		
				if ('string' === typeof el) {
			
					ansiString += el;
			
				}
				else if ('object' === typeof el) {
			
					ansiString += parseToAnsi(el, object);
			
				}
		
			});
			ansiString += closeTag;
	
		}
		else {
	
			ansiString = openTag + closeTag;
	
		}
		if (isOrig) {
	
			return ansiHtmlToText(ansiString);
	
		}
		else {
	
			return ansiString;
	
		}
	
	}

}

module.exports = parseToText;
