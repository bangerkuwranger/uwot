'use strict';
var fs = require('fs-extra');
var path = require('path');
var sanitize = require('./helpers/valueConversion');

class UwotTheme {

	constructor(
		name,
		path
	) {
	
		this.name = sanitize.cleanString(name, 255);
		this.path = sanitize.cleanString(path, 1024);
	
	}

}

module.exports = UwotTheme;
