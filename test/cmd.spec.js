var path = require('path');
var fs = require('fs');
const globalSetupHelper = require('../helpers/globalSetup');
globalSetupHelper.initConstants();

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const Cmd = require('../cmd');
var cmd;

describe('cmd.js', function() {

	describe('UwotCmd', function() {
	
		beforeEach(function() {
		
			cmd = new Cmd(
				{
					name: 'testCmd',
					description: 'test command instance',
					requiredArguments: [
						'argOne',
						'argTwo',
						'argThree'
					],
					optionalArguments: [
						'optArgOne',
						'optArgTwo',
						'optArgThree'
					]
				},
				[
					{
						description: 'the save flag',
						shortOpt: 's',
						longOpt: 'save',
						requiredArguments: [],
						optionalArguments: []
					},
					{
						description: 'the global flag',
						shortOpt: 'g',
						longOpt: 'global',
						requiredArguments: [],
						optionalArguments: []
					},
					{
						description: 'the recursive flag',
						shortOpt: 'r',
						longOpt: 'recursive',
						requiredArguments: [],
						optionalArguments: []
					}
				],
				path.resolve(global.Uwot.Constants.appRoot, 'test/cmd.spec.js')
			);
		
		});
		describe('constructor', function() {
		
			it('should be a function', function() {
			
				expect(Cmd).to.be.a('function');
			
			});
		
		});
		describe('execute', function() {
		
			it('should be a function', function() {
			
				expect(cmd.execute).to.be.a('function');
			
			});
		
		});
		describe('help', function() {
		
			it('should be a function', function() {
			
				expect(cmd.help).to.be.a('function');
			
			});
		
		});
		describe('matchOpt', function() {
		
			it('should be a function', function() {
			
				expect(cmd.matchOpt).to.be.a('function');
			
			});
		
		});
		describe('parsePre', function() {
		
			it('should be a function', function() {
			
				expect(cmd.parsePre).to.be.a('function');
			
			});
		
		});
		describe('escapeHtml', function() {
		
			it('should be a function', function() {
			
				expect(cmd.escapeHtml).to.be.a('function');
			
			});
		
		});
	
	});
	describe('UwotCmdCommand', function() {
	
		describe('constructor', function() {
		
			it('should not be callable outside of UwotCmd methods', function() {
			
				function returnNewCmdCommand() {
				
					return new UwotCmdCommad();
				
				}
				expect(returnNewCmdCommand).to.throw(ReferenceError, 'UwotCmdCommad is not defined');
			
			});
		
		});
	
	});
	describe('UwotCmdOption', function() {
	
		describe('constructor', function() {
		
			it('should not be callable outside of UwotCmd methods', function() {
			
				function returnNewCmdOption() {
				
					return new UwotCmdOption();
				
				}
				expect(returnNewCmdOption).to.throw(ReferenceError, 'UwotCmdOption is not defined');
			
			});
		
		});
	
	});

});
