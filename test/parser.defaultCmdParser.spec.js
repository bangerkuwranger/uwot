const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const RuntimeCmds = require('../parser/RuntimeCmds');
const bashParser = require('bash-parser');

const defaultCmdParser = require('../parser/defaultCmdParser');

describe('defaultCmdParser.js', function() {

	describe('defaultCmdParser', function() {
	
		afterEach(function() {

			sinon.restore();

		});
		it('should be a function');
		it('should throw a TypeError if callback arg value is not a function');

	});

});
