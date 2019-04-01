'use strict';
const path = require('path');

class UwotCmdUname extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/uname/execute');
		
		}
		else {
		
			var returnString = '';
			const envVars = {
				s: 'Uwot',
				m: global.process.arch,
				n: global.Uwot.Config.getConfigServerOrigin(),
				p: global.process.argv0,
				r: global.process.version,
				v: global.Uwot.Constants.version
			};
			if ('object' === typeof options && Array.isArray(options) && options.length > 0) {
	
				for (let i = 0; i < options.length; i++) {
		
					if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "a") {
		
						i = options.length;
						return callback(false, envVars.s + ' ' + envVars.v + ' ' + envVars.n + ' ' + envVars.p + ' ' + envVars.r + ' ' + envVars.m);
		
					}
					if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "m") {
		
						returnString += envVars.m;
		
					}
					if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "n") {
		
						returnString += envVars.n;
		
					}
					if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "p") {
		
						returnString += envVars.p;
		
					}
					if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "r") {
		
						returnString += envVars.r;
		
					}
					if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "s") {
		
						returnString += envVars.s;
		
					}
					if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "v") {
		
						returnString += "v" + envVars.v;
		
					}
					if ((i + 1) < options.length) {
					
						returnString += ' ';
					
					}
					else {
					
						return callback(false, returnString);
					
					}
	
				}
	
			}
			else {
			
				return callback(false, envVars.s);
			
			}
		
		}
	
	}
	
	help(callback) {
	
		super.help(callback);
	
	}

}

var uname = new UwotCmdUname(
	{
		name:				'uname',
		description:		'Print system name. The uname utility writes symbols representing one or more system characteristics to the standard output.',
		requiredArguments:	[],
		optionalArguments:	[]
	},
	[
		{
			description: 		'Output all strings from flags s, v, n, p, r, & m',
			shortOpt: 			'a',
			longOpt: 			null,
			requiredArguments:	[],
			optionalArguments:	[]
		},
		{
			description: 		'Print server hardware architecture.',
			shortOpt: 			'm',
			longOpt: 			null,
			requiredArguments:	[],
			optionalArguments:	[]
		},
		{
			description:		'Print the network domain information.',
			shortOpt:			'n',
			longOpt:			null,
			requiredArguments:	[],
			optionalArguments:	[]
		},
		{
			description: 		'Print the runtime name.',
			shortOpt: 			'p',
			longOpt: 			null,
			requiredArguments:	[],
			optionalArguments:	[]
		},
		{
			description: 		'Print the runtime version.',
			shortOpt: 			'r',
			longOpt: 			null,
			requiredArguments:	[],
			optionalArguments:	[]
		},
		{
			description:		'Print the system name.',
			shortOpt:			's',
			longOpt:			null,
			requiredArguments:	[],
			optionalArguments:	[]
		},
		{
			description:		'Print the system version.',
			shortOpt:			'v',
			longOpt:			null,
			requiredArguments:	[],
			optionalArguments:	[]
		}
	],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/uname')
);

module.exports = uname;
