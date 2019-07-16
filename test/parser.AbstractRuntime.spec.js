'use-strict';

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const AbstractRuntime = require('../parser/AbstractRuntime');

describe('AbstractRuntime.js', function() {

	describe('UwotAbstractRuntime', function() {
	
		afterEach(function() {

			sinon.restore();

		});
		describe('constructor(ast, user)', function() {
		
			it('should be a function', function() {
			
				expect(AbstractRuntime).to.be.a('function');
			
			});
			it('should not be able to be instantiated directly', function() {
			
				function throwTypeError() {
				
					return new AbstractRuntime();
				
				}
				expect(throwTypeError).to.throw(TypeError, 'Abstract class "UwotAbstractRuntime" cannot be instantiated directly');
			
			});
			it('should throw a TypeError if the implementing class does not implement the buildCommands method', function() {
			
				class ConcreteRuntimeNoBuildCommands extends AbstractRuntime {
				
					constructor(ast, user) {

						super(ast, user);
					
					}
					
					executeCommands(cb) {
					
						return cb(false);
					
					}
					
					parseCommandNode(astCmd, output, input) {
					
						return astCmd;
					
					}
					
					outputLine(output, type) {
					
						return output;
					
					}
					
					executeMap(exeMap, outputType) {
					
						return exeMap;
					
					}
				
				}
				function throwTypeError() {
				
					return new ConcreteRuntimeNoBuildCommands({}, {});
				
				}
				expect(throwTypeError).to.throw(TypeError, 'class extending "UwotAbstractRuntime" must implement method buildCommands');
			
			});
			it('should throw a TypeError if the implementing class does not implement the executeCommands method', function() {
			
				class ConcreteRuntimeNoExecuteCommands extends AbstractRuntime {
				
					constructor(ast, user) {

						super(ast, user);
					
					}
					
					buildCommands() {
					
						return false;
					
					}
					
					parseCommandNode(astCmd, output, input) {
					
						return astCmd;
					
					}
					
					outputLine(output, type) {
					
						return output;
					
					}
					
					executeMap(exeMap, outputType) {
					
						return exeMap;
					
					}
				
				}
				function throwTypeError() {
				
					return new ConcreteRuntimeNoExecuteCommands({}, {});
				
				}
				expect(throwTypeError).to.throw(TypeError, 'class extending "UwotAbstractRuntime" must implement method executeCommands');
			
			});
			it('should assign a method to parseCommandNode that throws a TypeError if the implementing class does not implement the parseCommandNode method', function() {
			
				class ConcreteRuntimeNoParseCommandNode extends AbstractRuntime {
				
					constructor(ast, user) {

						super(ast, user);
					
					}
					
					buildCommands() {
					
						return false;
					
					}
					
					executeCommands(cb) {
					
						return cb(false);
					
					}
					
					outputLine(output, type) {
					
						return output;
					
					}
					
					executeMap(exeMap, outputType) {
					
						return exeMap;
					
					}
				
				}
				function throwTypeError() {
				
					return new ConcreteRuntimeNoParseCommandNode({}, {});
				
				}
				expect(throwTypeError().parseCommandNode()).to.be.an.instanceof(TypeError).with.property('message').that.equals('class extending "UwotAbstractRuntime" has not implemented method parseCommandNode');
			
			});
			it('should assign a method to outputLine that throws a TypeError if the implementing class does not implement the outputLine method', function() {
			
				class ConcreteRuntimeNoOutputLine extends AbstractRuntime {
				
					constructor(ast, user) {

						super(ast, user);
					
					}
					
					buildCommands() {
					
						return false;
					
					}
					
					executeCommands(cb) {
					
						return cb(false);
					
					}
					
					parseCommandNode(astCmd, output, input) {
					
						return astCmd;
					
					}
					
					executeMap(exeMap, outputType) {
					
						return exeMap;
					
					}
				
				}
				function throwTypeError() {
				
					return new ConcreteRuntimeNoOutputLine({}, {});
				
				}
				expect(throwTypeError().outputLine()).to.be.an.instanceof(TypeError).with.property('message').that.equals('class extending "UwotAbstractRuntime" has not implemented method outputLine');
			
			});
			it('should assign a method to executeMap that throws a TypeError if the implementing class does not implement the executeMap method', function() {
			
				class ConcreteRuntimeNoExecuteMap extends AbstractRuntime {
				
					constructor(ast, user) {

						super(ast, user);
					
					}
					
					buildCommands() {
					
						return false;
					
					}
					
					executeCommands(cb) {
					
						return cb(false);
					
					}
					
					parseCommandNode(astCmd, output, input) {
					
						return astCmd;
					
					}
					
					outputLine(output, type) {
					
						return output;
					
					}
				
				}
				function throwTypeError() {
				
					return new ConcreteRuntimeNoExecuteMap({}, {});
				
				}
				expect(throwTypeError().executeMap()).to.be.an.instanceof(TypeError).with.property('message').that.equals('class extending "UwotAbstractRuntime" has not implemented method executeMap');
			
			});
		
		});
		describe('addAppInstance(app)', function() {
		
			it('should be a function', function() {
			
				class ConcreteRuntime extends AbstractRuntime {
				
					constructor(ast, user) {

						super(ast, user);
					
					}
					
					buildCommands() {
					
						return false;
					
					}
					
					executeCommands(cb) {
					
						return cb(false);
					
					}
					
					parseCommandNode(astCmd, output, input) {
					
						return astCmd;
					
					}
					
					outputLine(output, type) {
					
						return output;
					
					}
					
					executeMap(exeMap, outputType) {
					
						return exeMap;
					
					}
				
				}
				var testConcreteRuntime = new ConcreteRuntime({}, {});
				expect(testConcreteRuntime.addAppInstance).to.be.a('function');
			
			});
			it('should assign the app arg value of the runtime instance to its app property', function() {
			
				class ConcreteRuntime extends AbstractRuntime {
				
					constructor(ast, user) {

						super(ast, user);
					
					}
					
					buildCommands() {
					
						return false;
					
					}
					
					executeCommands(cb) {
					
						return cb(false);
					
					}
					
					parseCommandNode(astCmd, output, input) {
					
						return astCmd;
					
					}
					
					outputLine(output, type) {
					
						return output;
					
					}
					
					executeMap(exeMap, outputType) {
					
						return exeMap;
					
					}
				
				}
				var testConcreteRuntime = new ConcreteRuntime({}, {});
				testConcreteRuntime.addAppInstance('phlogiston')
				expect(testConcreteRuntime.app).to.equal('phlogiston');
			
			});
		
		});
		describe('addInstanceSessionId(isid)', function() {
		
			it('should be a function', function() {
			
				class ConcreteRuntime extends AbstractRuntime {
				
					constructor(ast, user) {

						super(ast, user);
					
					}
					
					buildCommands() {
					
						return false;
					
					}
					
					executeCommands(cb) {
					
						return cb(false);
					
					}
					
					parseCommandNode(astCmd, output, input) {
					
						return astCmd;
					
					}
					
					outputLine(output, type) {
					
						return output;
					
					}
					
					executeMap(exeMap, outputType) {
					
						return exeMap;
					
					}
				
				}
				var testConcreteRuntime = new ConcreteRuntime({}, {});
				expect(testConcreteRuntime.addInstanceSessionId).to.be.a('function');
			
			});
			it('should assign the isid arg value of the runtime instance to its isid property', function() {
			
				class ConcreteRuntime extends AbstractRuntime {
				
					constructor(ast, user) {

						super(ast, user);
					
					}
					
					buildCommands() {
					
						return false;
					
					}
					
					executeCommands(cb) {
					
						return cb(false);
					
					}
					
					parseCommandNode(astCmd, output, input) {
					
						return astCmd;
					
					}
					
					outputLine(output, type) {
					
						return output;
					
					}
					
					executeMap(exeMap, outputType) {
					
						return exeMap;
					
					}
				
				}
				var testConcreteRuntime = new ConcreteRuntime({}, {});
				testConcreteRuntime.addInstanceSessionId('phlogiston')
				expect(testConcreteRuntime.isid).to.equal('phlogiston');
			
			});
		
		});

	});

});
