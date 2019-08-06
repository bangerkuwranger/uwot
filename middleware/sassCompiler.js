var path = require('path');
var fs = require('fs-extra');
var sass = require('sass');
const EOL = require('os').EOL;

const PROD_STYLE = 'compressed';
const DEV_STYLE = 'expanded';
const BASE_DIR = global.Uwot.Constants.appRoot + '/public';

function getOSLF() {

	switch(EOL) {
	
		case "\r\n":
			return "crlf";
		case "\r":
			return "cr";
		case "\n\r":
			return "lfcr";
		default:
			return "lf";
	
	}

}

function getArgs(filePath) {

	var isDev = "development" === global.process.env.NODE_ENV;
	return {
		file: path.join(BASE_DIR, 'scss', filePath + '.scss'),
		outputStyle: isDev ? DEV_STYLE : PROD_STYLE,
		includePaths: [
			BASE_DIR + '/scss/_partial',
			BASE_DIR + '/scss/_partial/compass',
			BASE_DIR + '/scss/theme'
		],
		linefeed: getOSLF(),
		omitSourceMapUrl: isDev ? false : true,
		outFile: path.join(BASE_DIR, 'css', filePath + '.css'),
		sourceMap: true
	};

}

// filePath is relative to public/scss and does not include file ext
function renderFile(filePath) {



}

function renderMainStyle() {



}

function renderLocalThemes() {



}

function renderExternalThemes() {



}

module.exports = {
	renderMainStyle,
	renderLocalThemes,
	renderExternalThemes
};
