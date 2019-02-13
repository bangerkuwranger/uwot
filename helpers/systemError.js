'use strict';

// NOTE: errors created w/ this module should NEVER be thrown as exceptions.

// exports functions returning objects of class SystemError, given context
// using almost the same logic from node's core errors.js
// BUT dumber and less efficient: hardcodes the messages using values from the uv header
// context is obj with props:
// 	(string)dest
//	(string)path
//	(string)syscall //if omitted, all functions return a UNKNOWN error code and syscall of 'unknown'

// SystemError constructor creates object with immutable properties matching final node
// 	SystemError objects, as well as getters and setters for internal SystemError class props.
//	use getters and setters for changing and returning dynamic values, otherwise
//	properties can be directly returned using dot notation like 'real' SystemErrors

// Usage:
//	const systemError = require('path/to/helpers/systemError');
//	function fakeSystemProcess(args, callback) {
//		doSomething(args, function(err, val) {
//			if(err) {
// 				var context = {path: '/usr/local/bin/mongo', syscall: 'unlink'};
// 				var error = systemError.EPERM(context);
// 				console.error(error.message);
// 				return callback(error, null);
//			}
//			return callback(false, val);
//		});
//	}


// UV posix errnos in descending order
const UV__ENOTTY				= -4029;
const UV__EREMOTEIO 			= -4030;
const UV__EMLINK				= -4032;
const UV__ENXIO					= -4033;
const UV__ERANGE				= -4034;
const UV__ENOPROTOOPT			= -4035;
const UV__EFBIG					= -4036;
const UV__EXDEV					= -4037;
const UV__ETXTBSY				= -4038;
const UV__ETIMEDOUT				= -4039;
const UV__ESRCH					= -4040;
const UV__ESPIPE				= -4041;
const UV__ESHUTDOWN				= -4042;
const UV__EROFS					= -4043;
const UV__EPROTOTYPE			= -4044;
const UV__EPROTONOSUPPORT		= -4045;
const UV__EPROTO				= -4046;
const UV__EPIPE					= -4047;
const UV__EPERM					= -4048;
const UV__ENOTSUP				= -4049;
const UV__ENOTSOCK				= -4050;
const UV__ENOTEMPTY				= -4051;
const UV__ENOTDIR				= -4052;
const UV__ENOTCONN				= -4053;
const UV__ENOSYS				= -4054;
const UV__ENOSPC				= -4055;
const UV__ENONET				= -4056;
const UV__ENOMEM				= -4057;
const UV__ENOENT				= -4058;
const UV__ENODEV				= -4059;
const UV__ENOBUFS				= -4060;
const UV__ENFILE				= -4061;
const UV__ENETUNREACH			= -4062;
const UV__ENETDOWN				= -4063;
const UV__ENAMETOOLONG			= -4064;
const UV__EMSGSIZE				= -4065;
const UV__EMFILE				= -4066;
const UV__ELOOP					= -4067;
const UV__EISDIR				= -4068;
const UV__EISCONN				= -4069;
const UV__EIO					= -4070;
const UV__EINVAL				= -4071;
const UV__EINTR					= -4072;
const UV__EHOSTUNREACH			= -4073;
const UV__EFAULT				= -4074;
const UV__EEXIST				= -4075;
const UV__EDESTADDRREQ			= -4076;
const UV__ECONNRESET			= -4077;
const UV__ECONNREFUSED			= -4078;
const UV__ECONNABORTED			= -4079;
const UV__ECHARSET				= -4080;
const UV__ECANCELED				= -4081;
const UV__EBUSY					= -4082;
const UV__EBADF					= -4083;
const UV__EALREADY				= -4084;
const UV__EAGAIN				= -4088;
const UV__EAFNOSUPPORT			= -4089;
const UV__EADDRNOTAVAIL			= -4090;
const UV__EADDRINUSE			= -4091;
const UV__EACCES				= -4092;
const UV__E2BIG					= -4093;
const UV__EOF					= -4095;
const UV__UNKNOWN				= -4094;

const messages = new Map([
	['ENOTTY',
	{
		errno: UV__ENOTTY,
		message: 'inappropriate I/O control operation'
	}
	],
	['EREMOTEIO',
	{
		errno: UV__EREMOTEIO,
		message: 'remote I/O error'
	}
	],
	['EMLINK',
	{
		errno: UV__EMLINK,
		message: 'too many links'
	}
	],
	['ENXIO',
	{
		errno: UV__ENXIO,
		message: 'no such device or address'
	}
	],
	['ENXIO',
	{
		errno: UV__ENXIO,
		message: 'no such device or address'
	}
	],
	['ERANGE',
	{
		errno: UV__ERANGE,
		message: 'result too large'
	}
	],
	['ENOPROTOOPT',
	{
		errno: UV__ENOPROTOOPT,
		message: 'protocol not available'
	}
	],
	['EFBIG',
	{
		errno: UV__EFBIG,
		message: 'file too large'
	}
	],
	['EXDEV',
	{
		errno: UV__EXDEV,
		message: 'improper link'
	}
	],
	['ETXTBSY',
	{
		errno: UV__ETXTBSY,
		message: 'text file busy'
	}
	],
	['ETIMEDOUT',
	{
		errno: UV__ETIMEDOUT,
		message: 'connection timed out'
	}
	],
	['ESRCH',
	{
		errno: UV__ESRCH,
		message: 'no such process'
	}
	],
	['ESPIPE',
	{
		errno: UV__ESPIPE,
		message: 'invalid seek'
	}
	],
	['ESHUTDOWN',
	{
		errno: UV__ESHUTDOWN,
		message: 'cannot send after transport endpoint shutdown'
	}
	],
	['EROFS',
	{
		errno: UV__EROFS,
		message: 'read-only filesystem'
	}
	],
	['EPROTOTYPE',
	{
		errno: UV__EPROTOTYPE,
		message: 'protocol wrong type for socket'
	}
	],
	['EPROTONOSUPPORT',
	{
		errno: UV__EPROTONOSUPPORT,
		message: 'protocol not supported'
	}
	],
	['EPROTO',
	{
		errno: UV__EPROTO,
		message: 'protocol error'
	}
	],
	['EPIPE',
	{
		errno: UV__EPIPE,
		message: 'broken pipe'
	}
	],
	['EPERM',
	{
		errno: UV__EPERM,
		message: 'operation not permitted'
	}
	],
	['ENOTSUP',
	{
		errno: UV__ENOTSUP,
		message: 'operation not supported'
	}
	],
	['ENOTSOCK',
	{
		errno: UV__ENOTSOCK,
		message: 'not a socket'
	}
	],
	['ENOTEMPTY',
	{
		errno: UV__ENOTEMPTY,
		message: 'directory not empty'
	}
	],
	['ENOTDIR',
	{
		errno: UV__ENOTDIR,
		message: 'not a directory'
	}
	],
	['ENOTCONN',
	{
		errno: UV__ENOTCONN,
		message: 'the socket is not connected'
	}
	],
	['ENOSYS',
	{
		errno: UV__ENOSYS,
		message: 'function not implemented'
	}
	],
	['ENOSPC',
	{
		errno: UV__ENOSPC,
		message: 'no space left on device'
	}
	],
	['ENONET',
	{
		errno: UV__ENONET,
		message: 'machine is not on the network'
	}
	],
	['ENOMEM',
	{
		errno: UV__ENOMEM,
		message: 'not enough space/cannot allocate memory'
	}
	],
	['ENOENT',
	{
		errno: UV__ENOENT,
		message: 'no such file or directory'
	}
	],
	['ENODEV',
	{
		errno: UV__ENODEV,
		message: 'no such device'
	}
	],
	['ENOBUFS',
	{
		errno: UV__ENOBUFS,
		message: 'no buffer space available'
	}
	],
	['ENFILE',
	{
		errno: UV__ENFILE,
		message: 'too many open files in system'
	}
	],
	['ENETUNREACH',
	{
		errno: UV__ENETUNREACH,
		message: 'network unreachable'
	}
	],
	['ENETDOWN',
	{
		errno: UV__ENETDOWN,
		message: 'network is down'
	}
	],
	['ENAMETOOLONG',
	{
		errno: UV__ENAMETOOLONG,
		message: 'filename too long'
	}
	],
	['EMSGSIZE',
	{
		errno: UV__EMSGSIZE,
		message: 'message too long'
	}
	],
	['EMFILE',
	{
		errno: UV__EMFILE,
		message: 'too many open files'
	}
	],
	['ELOOP',
	{
		errno: UV__ELOOP,
		message: 'too many levels of symbolic links'
	}
	],
	['EISDIR',
	{
		errno: UV__EISDIR,
		message: 'is a directory'
	}
	],
	['EISCONN',
	{
		errno: UV__EISCONN,
		message: 'socket is connected'
	}
	],
	['EIO',
	{
		errno: UV__EIO,
		message: 'input/output error'
	}
	],
	['EINVAL',
	{
		errno: UV__EINVAL,
		message: 'invalid argument'
	}
	],
	['EINTR',
	{
		errno: UV__EINTR,
		message: 'interrupted function call'
	}
	],
	['EHOSTUNREACH',
	{
		errno: UV__EHOSTUNREACH,
		message: 'host is unreachable'
	}
	],
	['EFAULT',
	{
		errno: UV__EFAULT,
		message: 'bad address'
	}
	],
	['EEXIST',
	{
		errno: UV__EEXIST,
		message: 'file exists'
	}
	],
	['EDESTADDRREQ',
	{
		errno: UV__EDESTADDRREQ,
		message: 'destination address required'
	}
	],
	['ECONNRESET',
	{
		errno: UV__ECONNRESET,
		message: 'connection reset'
	}
	],
	['ECONNREFUSED',
	{
		errno: UV__ECONNREFUSED,
		message: 'connection refused'
	}
	],
	['ECONNABORTED',
	{
		errno: UV__ECONNABORTED,
		message: 'connection aborted'
	}
	],
	['ECHARSET',
	{
		errno: UV__ECHARSET,
		message: 'invalid Unicode character'
	}
	],
	['ECANCELED',
	{
		errno: UV__ECANCELED,
		message: 'operation canceled'
	}
	],
	['EBUSY',
	{
		errno: UV__EBUSY,
		message: 'device or resource busy'
	}
	],
	['EBADF',
	{
		errno: UV__EBADF,
		message: 'bad file descriptor'
	}
	],
	['EALREADY',
	{
		errno: UV__EALREADY,
		message: 'connection already in progress'
	}
	],
	['EAGAIN',
	{
		errno: UV__EAGAIN,
		message: 'resource temporarily unavailable'
	}
	],
	['EAFNOSUPPORT',
	{
		errno: UV__EAFNOSUPPORT,
		message: 'address family not supported'
	}
	],
	['EADDRNOTAVAIL',
	{
		errno: UV__EADDRNOTAVAIL,
		message: 'address not available'
	}
	],
	['EADDRINUSE',
	{
		errno: UV__EADDRINUSE,
		message: 'address already in use'
	}
	],
	['EACCES',
	{
		errno: UV__EACCES,
		message: 'permission denied'
	}
	],
	['E2BIG',
	{
		errno: UV__E2BIG,
		message: 'argument list too long'
	}
	],
	['EOF',
	{
		errno: UV__EOF,
		message: 'end of file'
	}
	],
	['UNKNOWN',
	{
		errno: UV__UNKNOWN,
		message: 'tomb of the unknown error'
	}
	]
]);

let buffer;
function lazyBuffer() {

	if (buffer === undefined) {
	
		buffer = require('buffer').Buffer;
	
	}
	return buffer;

}

var sysErrors = {};
for (var key of messages.keys()) {

	sysErrors[key] = function(context) {
	
		// TBD
		// Test if we can captureStackTrace or if strict mode throws error.
		return new SystemError(this, context);
	
	}.bind(key);

};
module.exports = sysErrors;


class SystemError extends Error {

	constructor(key, context) {
		
		var message;
		var msgConst;
		if (context.syscall === undefined) {
		
			key = 'UNKNOWN';
			msgConst = messages.get(key);
			let desc = msgConst.message;
			context.syscall = 'unknown';
			message = `${key}:  $desc`;
		
		}
		else {
		
			msgConst = messages.get(key);
			let desc = msgConst.message;
			message = `${key}: ${desc}, ${context.syscall}`;
		 
		}
		if (context.path !== undefined){
		
			message += ` ${context.path}`;
		
		}
		if (context.dest !== undefined) {
		
			message += ` => ${context.dest}`;
		
		}
		context.errno = msgConst.errno;
		super(message);
		Object.defineProperty(this, 'kInfo', {
			configurable: false,
			enumerable: false,
			value: context
		});
		Object.defineProperty(this, 'kCode', {
			configurable: true,
			enumerable: false,
			value: key,
			writable: true
		});
		Object.defineProperty(this, 'code', {
			enumerable: true,
			value: key
		});
		Object.defineProperty(this, 'dest', {
			enumerable: true,
			value: context.dest
		});
		Object.defineProperty(this, 'path', {
			enumerable: true,
			value: context.path
		});
		Object.defineProperty(this, 'errno', {
			enumerable: true,
			value: context.errno
		});
		// Object.defineProperty(this, 'stack', {
// 			enumerable: true,
// 			value: 
Error.captureStackTrace(this, SystemError)
// 		});
		
  }

  	get name() {
  
    	return `SystemError ${this['kCode']}`;
    
  	}

	set name(value) {
	
		defineProperty(this, 'name', {
			configurable: true,
			enumerable: true,
			value,
			writable: true
		});
	
	}

	get code() {

		return this[kCode];

	}

	set code(value) {
	
		defineProperty(this, 'code', {
			  configurable: true,
			  enumerable: true,
			  value,
			  writable: true
		});
	
	}

	get info() {
	
		return this[kInfo];
	
	}

	get errno() {
	
		return this[kInfo].errno;
	
	}

	set errno(val) {
	
		this[kInfo].errno = val;
	
	}

	get syscall() {
	
		return this[kInfo].syscall;
	
	}

	set syscall(val) {
	
		this[kInfo].syscall = val;
	
	}

	get path() {
	
		return this[kInfo].path !== undefined ? this[kInfo].path.toString() : undefined;
	
	}

	set path(val) {
	
		this[kInfo].path = val ?
	  		lazyBuffer().from(val.toString()) : undefined;
	
	}

	get dest() {
	
		return this[kInfo].path !== undefined ?
	  		this[kInfo].dest.toString() : undefined;
	
	}

	set dest(val) {
	
		this[kInfo].dest = val ?
			lazyBuffer().from(val.toString()) : undefined;
	
	}

}
