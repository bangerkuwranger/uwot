var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if ('object' === typeof req.query && 'string' === typeof req.query.theme) {
	
		var themeName = decodeURIComponent(req.query.theme).trim();
		res.render('index', { title: 'WOT 1.0.0a - ' + themeName + ' theme', theme: themeName});
	
	}
	else {
	
		res.render('index', {title: 'WOT 1.0.0a'});
	
	}
});

module.exports = router;
