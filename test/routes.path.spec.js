const globalSetupHelper = require('../helpers/globalSetup');

const rewire = require('rewire');
const sinon = require("sinon");
const chai = require("chai");
const chaiHttp = require('chai-http');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(chaiHttp);

const nonceHandler = require('node-timednonce');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
app.disable('x-powered-by');

var ansiMiddleware, ansiMiddlewareSpy;

var pathRouter, Config;
const path = require('path');

describe('path.js', function() {

	var req, res;
	before(function() {
	
		if('object' !== typeof global.Uwot || null === global.Uwot) {
		
			globalSetupHelper.initGlobalObjects();
		
		}
		if('object' !== typeof global.Uwot.Constants || 'string' !== typeof global.Uwot.Constants.appRoot) {
		
			globalSetupHelper.initConstants();
		
		}
		if('object' !== typeof global.Uwot.Exports.Cmd || null === global.Uwot.Exports.Cmd) {
		
			globalSetupHelper.initExports();
		
		}
		Config = require('../config');
		if('object' !== typeof global.Uwot.Config || null === global.Uwot.Config || 'function' !== typeof global.Uwot.Config.getVal) {
		
			var configPath;
			if ("development" !== global.process.env.NODE_ENV) {

				configPath = path.resolve(global.Uwot.Constants.etcProd, 'config.json');

			}
			else {

				configPath = path.resolve(global.Uwot.Constants.etcDev, 'config.json');

			}

			// init global objects with instances of app classes
			global.Uwot.Config = new Config(configPath);
		
		}
		if('object' !== typeof global.Uwot.Bin || null === global.Uwot.Bin || 1 > Object.keys(global.Uwot.Bin).length) {
		
			globalSetupHelper.initBins();
		
		}
		// view engine setup
		app.set('views', path.join(global.Uwot.Constants.appRoot, 'views'));
		app.set('view engine', 'pug');
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: false }));
		app.use(cookieParser());
		pathRouter = rewire('../routes/path');
		pathRouter.__set__('ansiParser', ansiMiddlewareSpy);
		app.use('/bin', pathRouter);
		// catch 404 and forward to error handler
		app.use(function(req, res, next) {
			var err = new Error('Not Found');
			err.status = 404;
			next(err);
		});

		// error handler
		app.use(function(err, req, res, next) {
			// set locals, only providing error in development
			res.locals.message = err.message;
			res.locals.error = req.app.get('env') === 'development' ? err : {};

			// render the error page
			res.status(err.status || 500);
			res.render('error');
		});

	
	});
	describe('/', function() {
	
		describe('POST', function() {
		
			var indexNonce;
			beforeEach(function() {
			
				indexNonce = nonceHandler.create( 'index-get', 300000 );
			
			});
			afterEach(function() {
			
				sinon.restore();
			
			});
			it('should return a JSON response', function(done) {
			
				chai.request(app)
				.post('/bin')
				.send({nonce: null})
				.end((error, res) => {
				
					expect(error).to.be.null;
					expect(res.headers['content-type']).to.contain('application/json');
					done();
				
				});
			
			});
			it('should return a response requesting a page reload if req.body.nonce is not a string', function(done) {
			
				chai.request(app)
				.post('/bin')
				.send({nonce: null})
				.end((error, res) => {
				
					expect(error).to.be.null;
					expect(res.text).to.contain('Invalid Request - Reload');
					done();
				
				});
			
			});
			it('should return an invalid request response with nonce validation message if req.body.nonce is not valid nonce', function(done) {
			
				chai.request(app)
				.post('/bin')
				.send({nonce: indexNonce + "invalid"})
				.end((error, res) => {
				
					expect(error).to.be.null;
					expect(res.text).to.contain('Invalid Request - hash mismatch');
					done();
				
				});
			
			});
		
		});
	
	});

});
