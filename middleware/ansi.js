'use strict';

/**
 * Definitions of object->"ANSI" display html
 *
 * prop: (string)tag -> html: tag name
 * prop: (string)color -> html: class "fg-[colorName]"
 * prop: (string)backgroundColor -> html: class "bg-[colorName]"
 * prop: (bool)isReversed -> html: class "reversed"
 * prop: (bool)isBold -> html: class "bold"
 * prop: (bool)isUnderline -> html: class "underline"
 * prop: (array)content -> strings & hierarchical objects in order
 */

function parseToAnsi(ansiObj) {

	var tagName = 'string' == typeof ansiObj.tag ? ansiObj.tag : 'span';
	var classesString = "ansi";
	if ('string' == typeof ansiObj.color) {
	
		classesString += ' fg-' + ansiObj.color;
	
	}
	if ('string' == typeof ansiObj.backgroundColor) {
	
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
	var openTag = '<' + tagName + ' class="' + classesString + '">';
	var closeTag = '</' + tagName + '>';
	if ('undefined' == typeof ansiObj.content) {
	
		return '<' + tagName + ' class="' + classesString + '" />';
	
	}
	else if ('string' == typeof ansiObj.content) {
	
		return openTag + ansiObj.content + closeTag;
	
	}
	else if ('object' == typeof ansiObj.content && Array.isArray(ansiObj.content)) {
	
		var ansiString = openTag;
		ansiObj.content.forEach(function(el) {
		
			if ('string' == typeof el) {
			
				ansiString += el;
			
			}
			else if ('object' == typeof el) {
			
				ansiString += parseToAnsi(el);
			
			}
		
		});
		ansiString += closeTag;
		return ansiString;
	
	}
	else {
	
		return openTag + closeTag;
	
	}
}

function ansi(obj) {

	var val = obj;
	if ('object' == typeof val && 'object' == typeof val.output) {
	
		obj.output = parseToAnsi(val.output);
		return this.json(obj);
	
	}
	else {
		return this.json(obj);
	}

}

module.exports = function(args) {

	return function(req, res, next) {
	
		res.ansi = ansi;
		next();
	
	};

};
