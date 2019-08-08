var path = require('path');
var fs = require('fs-extra');
var sass = require('sass');
const os = require('os');

const PROD_STYLE = 'compressed';
const DEV_STYLE = 'expanded';
const BASE_DIR = global.Uwot.Constants.appRoot + '/public';
const MAIN_STYLE = 'style';

const ENV_SPEC = {
	EOL: os.EOL,
	isDev: "development" === global.process.env.NODE_ENV
};

function getOSLF() {

	switch(ENV_SPEC.EOL) {
	
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

	if ('string' !== typeof filePath) {
	
		throw new TypeError('invalid filePath passed to getArgs');
	
	}
	return {
		file: path.join(BASE_DIR, 'scss', filePath + '.scss'),
		outputStyle: ENV_SPEC.isDev ? DEV_STYLE : PROD_STYLE,
		includePaths: [
			BASE_DIR + '/scss/_partial',
			BASE_DIR + '/scss/_partial/compass',
			BASE_DIR + '/scss/theme'
		],
		linefeed: getOSLF(),
		omitSourceMapUrl: ENV_SPEC.isDev ? false : true,
		outFile: path.join(BASE_DIR, 'css', filePath + '.css'),
		sourceMap: true
	};

}

// filePath is relative to public/scss and does not include file ext
function renderFile(filePath) {

	var argsObj;
	try {
	
		argsObj = module.exports.getArgs(filePath);
	
	}
	catch(e) {
	
		filePath = 'string' === typeof filePath ? filePath : '';
		return {
			errors: [e],
			source: filePath
		};
	
	}
	var renderData, returnObj = {
		source: argsObj.file,
		devMode: argsObj.outputStyle === DEV_STYLE,
		cssFile: argsObj.outFile,
		mapFile: argsObj.outFile + '.map',
		errors: []
	};
	try {
	
		renderData = sass.renderSync(argsObj);
	
	}
	catch(e) {
	
		e.message = 'rendering ' + filePath + ' failed. - ' + e.message;
		returnObj.errors.push(e);
		return returnObj;
	
	}
	if (renderData instanceof Error) {
	
		renderData.message = 'rendering ' + filePath + ' failed. - ' + renderData.message;
		returnObj.errors.push(renderData);
		return returnObj;
	
	}
	else {
	
		try {
		
			fs.outputFileSync(returnObj.cssFile, renderData.css);
		
		}
		catch(e) {
		
			e.message = 'writing css for ' + filePath + ' failed. - ' + e.message;
			returnObj.errors.push(e);
		
		}
		try {
		
			fs.outputFileSync(returnObj.mapFile, renderData.map);
		
		}
		catch(e) {
		
			e.message = 'writing source map for ' + filePath + ' failed. - ' + e.message;
			returnObj.errors.push(e);
		
		}
		return returnObj;
	
	}

}

function renderMainStyle() {

	var returnObj = {
		processed: [],
		errors: []
	};
	var result = module.exports.renderFile(MAIN_STYLE);
	if (result.errors.length > 0) {
	
		returnObj.errors = returnObj.errors.concat(result.errors);
	
	}
	delete result.errors;
	returnObj.processed.push(result);
	return returnObj;

}

function renderLocalThemes() {

	const THEME_DIR = path.join(BASE_DIR, 'scss/theme');
	var themes, returnObj = {
		processed: [],
		errors: []
	};
	try {
	
		themes = fs.readdirSync(THEME_DIR);
	
	}
	catch(e) {
	
		returnObj.errors.push(e);
		return returnObj;
	
	}
	if (themes.length > 0) {
	
		for (let i = 0; i < themes.length; i++) {
		
			var dirPath = path.join(THEME_DIR, themes[i]);
			var dirStat = fs.statSync(dirPath);
			if (dirStat.isDirectory()) {
			
				var filePath = path.join(dirPath, 'main.scss');
				var fileStat;
				try {
				
					fileStat = fs.statSync(filePath);
					var renderPath = 'theme/' + themes[i] + '/main';
					var result = module.exports.renderFile(renderPath);
					if (result.errors.length > 0) {
	
						returnObj.errors = returnObj.errors.concat(result.errors);
	
					}
					delete result.errors;
					returnObj.processed.push(result);
					if ((i + 1) >= themes.length) {
			
						return returnObj;
			
					}
				
				}
				catch(e) {
				
					if ((i + 1) >= themes.length) {
			
						return returnObj;
			
					}
				
				}
			
			}
			else {
			
				if ((i + 1) >= themes.length) {
		
					return returnObj;
		
				}
			
			}
		
		}
	
	}
	else {
	
		return returnObj;
	
	}

}

// TBD
function renderExternalThemes() {

	throw new Error('this function is not yet implemented');

}

function renderAll() {

	var mainResults, localResults, extResults, returnObj = {
		processed: [],
		errors: []
	};
	try {
	
		mainResults = module.exports.renderMainStyle();
		returnObj.processed = returnObj.processed.concat(mainResults.processed);
		returnObj.errors = returnObj.errors.concat(mainResults.errors);
	
	}
	catch(me) {
	
		returnObj.errors.push(me);
	
	}
	try {
	
		localResults = module.exports.renderLocalThemes();
		returnObj.processed = returnObj.processed.concat(localResults.processed);
		returnObj.errors = returnObj.errors.concat(localResults.errors);
	
	}
	catch(le) {
	
		returnObj.errors.push(le);
	
	}
	try {
	
		extResults = module.exports.renderExternalThemes();
		returnObj.processed = returnObj.processed = returnObj.processed.concat(extResults.processed);
		returnObj.errors = returnObj.errors.concat(extResults.errors);
	
	}
	catch(ee) {
	
		returnObj.errors.push(ee);
	
	}
	return returnObj;

}

function listStyles() {

	var returnObj = {
		main: [],
		local: [],
		external: []
	};
	var mainObj = {
		name: 'style',
		location: 'public/scss/style.scss'
	};
	try {
	
		mainObj.stats = fs.statSync(path.join(BASE_DIR, 'css', path.basename(mainObj.name, '.scss') + '.css'));
		mainObj.status = 'compiled ' + mainObj.stats.mtime.toLocaleString();
		
	
	}
	catch(e) {
	
		mainObj.status = 'NOT COMPILED';
	
	}
	returnObj.main.push(mainObj);
	const THEME_DIR_SRC = path.join(BASE_DIR, 'scss/theme');
	const THEME_DIR_TRG = path.join(BASE_DIR, 'css/theme');
	var themes;
	try {
	
		themes = fs.readdirSync(THEME_DIR_SRC);
	
	}
	catch(e) {
	
		returnObj.errors.push(e);
		return returnObj;
	
	}
	if (themes.length > 0) {
	
		var i = 0;
		themes.forEach((theme) => {
		
			var srcPath = path.join(THEME_DIR_SRC, themes[i], 'main.scss');
			var filePath = path.join(THEME_DIR_TRG, themes[i], 'main.css');
			var localObj = {
				name: themes[i],
				location: 'public/scss/theme/' + themes[i] + '/main.scss'
			};
			try {
			
				fs.statSync(srcPath);
				try {
			
					localObj.stats = fs.statSync(filePath);
					localObj.status = 'compiled ' + localObj.stats.mtime.toLocaleString();
			
				}
				catch(e) {
			
					localObj.status = "NOT COMPILED";
			
				}
				i++;
				returnObj.local.push(localObj);
			
			}
			catch(e) {
			
				i++;
			
			}
		
		});
	
	}
	
	// TBD
	// process ext themes
	
	return returnObj;

}

module.exports = {
	renderAll,
	renderMainStyle,
	renderLocalThemes,
	renderExternalThemes,
	renderFile,
	getArgs,
	ENV_SPEC,
	listStyles
};
