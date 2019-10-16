'use strict';
const EOL = require('os').EOL;

const getErrorContentObj = function(errInt) {

	switch(errInt) {
	
		case 401:
			return {
				errInt: '401',
				name: 'Unauthorized',
				rawDesc: 'This server could not verify that you are authorized to access the document requested. Either you supplied the wrong credentials (e.g., bad password), or your browser doesn\'t understand how to supply the credentials required.'
			}
		case 403:
			return {
				errInt: '403',
				name: 'Forbidden',
				rawDesc: 'You don\'t have permission to access the requested object. It is either read-protected or not readable by the server.'
			}
		case 404:
			return {
				errInt: '404',
				name: 'Not Found',
				rawDesc: "The requested URL was not found on this server. If you entered the URL manually please check your spelling and try again."
			}
		case 500:
			return {
				errInt: '500',
				name: 'Internal Server Error',
				rawDesc: "The server encountered an internal error and was unable to complete your request. Either the server is overloaded or there was an error in a script."
			}
		default:
			return null;
	
	}

};

module.exports = {

	getErrorHtmlFromTemplate(args) {
	
		var htmlString = '';
		if ('object' === typeof args && null !== args && 'string' === typeof args.name) {
		
			var errInt = '';
			if ('string' === typeof args.errInt) {
			
				errInt = args.errInt + ' ';
			
			}
			htmlString += "<html><head><title>" + errInt + args.name + '</title></head>';
			htmlString += '<body><h1>Error ' + errInt + args.name + '</h1>';
			if ('string' === typeof args.rawDesc) {
			
				var descArr = args.rawDesc.split(EOL);
				var pgphArr = descArr.map((lineStr) => {
				
					return '<p>' + lineStr + '</p>';
				
				});
				htmlString += pgphArr.join('');
			
			}
			else if ('string' === typeof args.htmlDesc) {
			
				htmlString += args.htmlDesc;
			
			}
			htmlString += '</body></html>';
		
		}
		else {
		
			htmlString = new Error('invalid browser Error');
		
		}
		return htmlString;
	
	}, 
	getHtmlForError(errInt) {
	
		if ('number' === typeof errInt) {
		
			var errorContent = getErrorContentObj(errInt);
			if (errorContent !== null) {
			
				return this.getErrorHtmlFromTemplate(errorContent);
			
			}
		
		}
		return new Error('invalid browser Error');
	
	},
	getErrIntFromSysCode(sysCode) {
	
		if ('string' !== typeof sysCode) {
		
			return 0;
		
		}
		switch(sysCode) {
		
			case 'EACCES':
				return 401;
			case 'EPERM':
				return 403;
			case 'ENOENT':
			case 'EISDIR':
				return 404;
			default:
				return 500;
		
		}
	
	}

};
