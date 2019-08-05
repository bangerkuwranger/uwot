const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var ansiMiddleware = require('../middleware/ansi');
var outputAnsi = require('../output/ansi');

describe('ansi.js', function() {

	var req, res;
	beforeEach(function() {
	
		req = {};
		res = {
			json(obj) {
			
				var objJson = JSON.stringify(obj);
				return objJson;
			
			}
		};
	
	});
	it('should return a function', function() {
	
		expect(ansiMiddleware).to.be.a('function');
	
	});
	describe('function(req, res, next)', function() {
	
		it('should be a function', function() {
		
			expect(ansiMiddleware()).to.be.a('function');
		
		});
		it('should assign a function from to the "ansi" property of res ans call next()', function(done) {
		
			ansiMiddleware()(req, res, function() {
			
				expect(res.ansi).to.be.a('function');
				done();
			
			});
		
		});
	
	});
	describe('res.ansi(obj)', function() {
	
		it('should be a function', function(done) {
		
			ansiMiddleware()(req, res, function() {
			
				expect(res.ansi).to.be.a('function');
				done();
			
			});
		
		});
		it('should call res.json with the result of output/ansi module function', function(done) {
		
			req.output = {tag: 'p', content:'test req output'};
			ansiMiddleware()(req, res, function() {
			
				expect(res.ansi(req)).to.equal('{"output":"<p class=\\"ansi\\">test req output</p>"}');
				done();
			
			});
		
		});
	
	});

});
