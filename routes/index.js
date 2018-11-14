var express = require('express');
var router = express.Router();
const binRouter = require('./path');
const nonceHandler = require('node-timednonce');

/* GET home page. */
router.get('/', function(req, res, next) {
	
	var respValues = {
		title: 'WOT 1.0.0a', 
		theme: 'default',
		nonce: nonceHandler.create( 'index-get', 300000 )
	};
	if ('object' === typeof req.query && 'string' === typeof req.query.theme) {
	
		var themeName = decodeURIComponent(req.query.theme).trim();
		respValues.title +=  ' - ' + themeName + ' theme';
		respValues.theme = themeName;
	
	}
	res.render('index', respValues);
});

router.use('/bin', binRouter);

module.exports = router;
