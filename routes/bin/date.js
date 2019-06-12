'use strict';
const path = require('path');

class UwotCmdDate extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/date/execute');
		
		}
		else {
		
			var now = new Date();
			return callback(false, now.toString());
		
		}
	
	}
	
	help(callback) {
	
		super.help(callback);
	
	}

}

var date = new UwotCmdDate(
	{
		name:				'date',
		description:		'Return current date and time',
		requiredArguments:	[],
		optionalArguments:	[]
	},
	[],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/date')
);

module.exports = date;
