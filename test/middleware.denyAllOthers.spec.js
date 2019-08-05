const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var denyAllOthers = require('../middleware/denyAllOthers');

describe('denyAllOthers.js', function() {

	var req, res;
	beforeEach(function() {
	
		req = {};
		res = {
			json(obj) {
			
				var objJson = JSON.stringify(obj);
				this.jsonOut = objJson;
				return objJson;
			
			}
		};
	
	});
	it('should return a function', function() {
	
		expect(denyAllOthers).to.be.a('function');
	
	});
	describe('function(req, res, next)', function() {
	
		it('should be a function', function() {
		
			expect(denyAllOthers()).to.be.a('function');
		
		});
		it('should call res.json with a string containing a permission denied ansi html tag', function() {
		
			denyAllOthers()(req, res, function() {});
			expect(res.jsonOut).to.equal('"<span class=\\"ansi fg-red\\">Permission Denied</span>"');
		
		});
		it('should call res.json with a string containing the value of req.body.cmd if req.body.cmd is a string', function() {
		
			req.body = {
				cmd: 'testCmd'
			};
			denyAllOthers()(req, res, function() {});
			expect(res.jsonOut).to.contain('testCmd');
		
		});
	
	});

});
