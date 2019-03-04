module.exports = function(args) {

	return function(req, res, next) {
	
		var denied = '';
		if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {
	
			denied += req.body.cmd.trim() + ': '; 
	
		}
		denied += '<span class="ansi fg-red">Permission Denied</span>';
		return res.json(denied);
	
	};

};

