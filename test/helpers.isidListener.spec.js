const globalSetupHelper = require('../helpers/globalSetup');
var Listener = require('../listener');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var isidListener = require('../helpers/isidListener');

describe('isidListener.js', function() {

	var testIsid, testDefaultListener;
	before(function() {
	
		globalSetupHelper.initConstants();
		testIsid = 'thefrogkermit';
		testDefaultListener = {
			name: 'default',
			isid: testIsid,
			type: 'default'
		};
	
	});
	afterEach(function() {
	
		delete global.Uwot.Listeners[testIsid];
	
	});
	describe('ensureGlobalListener(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.ensureGlobalListener).to.be.a('function');
		
		});
		it('should create an empty object as value of global.Uwot.Listeners if it is not already an object', function() {
		
			delete global.Uwot.Listeners;
			isidListener.ensureGlobalListener(testIsid);
			expect(global.Uwot.Listeners).to.be.an('object').that.is.not.null;
		
		});
		it('should create an empty object as value of global.Uwot.Listeners[isid] if it is not already an object', function() {
		
			delete global.Uwot.Listeners[testIsid];
			isidListener.ensureGlobalListener(testIsid);
			expect(global.Uwot.Listeners[testIsid]).to.be.an('object').that.is.not.null;
		
		});
		it('should return a reference to global.Uwot.Listeners[isid], which should be an empty object, if it did not exist prior to being called', function() {
		
			delete global.Uwot.Listeners[testIsid];
			isidListener.ensureGlobalListener(testIsid);
			expect(global.Uwot.Listeners[testIsid]).to.deep.equal({});
		
		});
		it('should return a reference to global.Uwot.Listeners[isid], which should be the already existing object, if it existed prior to being called', function() {
		
			var lilypadListeners = {
				'default': testDefaultListener
			};
			global.Uwot.Listeners[testIsid] = lilypadListeners;
			var globalListeners = isidListener.ensureGlobalListener(testIsid);
			expect(global.Uwot.Listeners[testIsid]).to.deep.equal(lilypadListeners);
			expect(globalListeners).to.deep.equal(lilypadListeners)
		
		});
		
	});
	describe('removeGlobalListener(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.removeGlobalListener).to.be.a('function');
		
		});
		it('should attempt to remove global.Uwot.Listeners[isid]', function() {
		
			isidListener.ensureGlobalListener(testIsid);
			isidListener.removeGlobalListener(testIsid);
			expect(global.Uwot.Listeners[testIsid]).to.be.undefined;
		
		});
		it('should return true if attempt was successful and threw no errors', function() {
		
			isidListener.ensureGlobalListener(testIsid);
			var wasRemoved = isidListener.removeGlobalListener(testIsid);
			expect(wasRemoved).to.be.true;
		
		});
		// this case is not really testable, or probable.
		it('should return false if attempt threw an error');
		
	});
	describe('newIsidDefaultListener(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.newIsidDefaultListener).to.be.a('function');
		
		});
		it('should call ensureGlobalListener', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').throws(new Error('test ensureGlobalListener error'));
			try {
			
				isidListener.newIsidDefaultListener()
				throw new Error('this is not the error you are looking for');
			
			}
			catch(e) {
			
				ensureGlobalListenerStub.restore();
				expect(e).to.be.an.instanceof(Error).with.property('message').that.equals('test ensureGlobalListener error');
			
			}
		
		});
		it('should set global.Uwot.Listeners[isid].default to a new instance of Listener class if current value is not a non-null object', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			delete global.Uwot.Listeners[testIsid];
			isidListener.newIsidDefaultListener(testIsid);
			expect(global.Uwot.Listeners[testIsid].default).to.be.an('object').with.property('isid').that.equals(testIsid);
			expect(global.Uwot.Listeners[testIsid].default.constructor.name).to.equal('UwotListener');
			global.Uwot.Listeners[testIsid].default = null;
			isidListener.newIsidDefaultListener(testIsid);
			expect(global.Uwot.Listeners[testIsid].default).to.be.an('object').with.property('isid').that.equals(testIsid);
			expect(global.Uwot.Listeners[testIsid].default.constructor.name).to.equal('UwotListener');
			ensureGlobalListenerStub.restore();
			delete global.Uwot.Listeners[testIsid];
		
		});
		it('should return an Error if instantiating the default Listener throws an error', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			expect(isidListener.newIsidDefaultListener(1234)).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid instanceSessionId passed to UwotListener contstructor');
			delete global.Uwot.Listeners[testIsid];
			delete global.Uwot.Listeners[1324];
			ensureGlobalListenerStub.restore();
		
		});
		it('should return the Listener global.Uwot.Listeners[isid].default if it was created without error or if it already existed', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			global.Uwot.Listeners[testIsid] = {};
			global.Uwot.Listeners[testIsid].default = testDefaultListener;
			var returnedListener;
			returnedListener = isidListener.newIsidDefaultListener(testIsid);
			expect(returnedListener).to.deep.equal(testDefaultListener);
			delete global.Uwot.Listeners[testIsid].default;
			returnedListener = isidListener.newIsidDefaultListener(testIsid);
			expect(returnedListener).to.be.an('object').with.property('isid').that.equals(testIsid);
			expect(returnedListener.constructor.name).to.equal('UwotListener');
			ensureGlobalListenerStub.restore();
			delete global.Uwot.Listeners[testIsid];
		
		});
		
	});
	describe('moveListeners(currentIsid, newIsid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.moveListeners).to.be.a('function');
		
		});
		it('should call ensureGlobalListener for isids in both args', function() {
		
			var testNewIsid = 'ladypig';
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			isidListener.moveListeners(testIsid, testNewIsid);
			delete global.Uwot.Listeners[testIsid];
			delete global.Uwot.Listeners[testNewIsid];
			expect(ensureGlobalListenerStub.calledWith(testIsid)).to.be.true;
			expect(ensureGlobalListenerStub.calledWith(testNewIsid)).to.be.true;
			ensureGlobalListenerStub.restore();
		
		});
		it('should call newIsidDefaultListener for the new isid and return global.Uwot.Listeners[newIsid] if the old isid had no existing global listeners', function() {
		
			var testNewIsid = 'ladypig';
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			var newIsidDefaultListenerStub = sinon.stub(isidListener, 'newIsidDefaultListener').callsFake(function setFakeGlobal(isid) {
			
				global.Uwot.Listeners[isid].default = testDefaultListener;
				global.Uwot.Listeners[isid].default.isid = isid;
				return global.Uwot.Listeners[isid].default;
			
			});
			delete global.Uwot.Listeners[testIsid];
			delete global.Uwot.Listeners[testNewIsid];
			var moveResult = isidListener.moveListeners(testIsid, testNewIsid);
			expect(newIsidDefaultListenerStub.calledWith(testNewIsid)).to.be.true;
			expect(moveResult).to.deep.equal({default: testDefaultListener});
			delete global.Uwot.Listeners[testIsid];
			delete global.Uwot.Listeners[testNewIsid];
			ensureGlobalListenerStub.restore();
			newIsidDefaultListenerStub.restore();
		
		});
		it('should create new listeners matching the old isid globals', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			var testNewIsid = 'ladypig';
			var testListener1 = Object.assign({}, testDefaultListener);
			testListener1.disable = function() { return; };
			var testListener2 = Object.assign({}, testListener1);
			testListener2.name = 'testadd';
			testListener2.type = 'additional';
			global.Uwot.Listeners[testIsid] = {
				default: testListener1,
				testadd: testListener2
			};
			var finalListeners = [testListener1.name, testListener2.name]
			delete global.Uwot.Listeners[testNewIsid];
			var moveResult = isidListener.moveListeners(testIsid, testNewIsid);
			expect(Object.keys(moveResult)).to.deep.equal(finalListeners);
			delete global.Uwot.Listeners[testIsid];
			delete global.Uwot.Listeners[testNewIsid];
			ensureGlobalListenerStub.restore();
		
		});
		it('should set the isid to newIsid value for all new listeners', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			var testNewIsid = 'ladypig';
			var testListener1 = Object.assign({}, testDefaultListener);
			testListener1.disable = function() { return; };
			var testListener2 = Object.assign({}, testListener1);
			testListener2.name = 'testadd';
			testListener2.type = 'additional';
			global.Uwot.Listeners[testIsid] = {
				default: testListener1,
				testadd: testListener2
			};
			delete global.Uwot.Listeners[testNewIsid];
			var moveResult = isidListener.moveListeners(testIsid, testNewIsid);
			expect(moveResult.default.isid).to.equal(testNewIsid);
			expect(moveResult[testListener2.name].isid).to.equal(testNewIsid);
			delete global.Uwot.Listeners[testIsid];
			delete global.Uwot.Listeners[testNewIsid];
			ensureGlobalListenerStub.restore();
		
		});
		it('should add all new listeners to the global listener object for newIsid', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			var testNewIsid = 'ladypig';
			var testListener1 = Object.assign({}, testDefaultListener);
			testListener1.disable = function() { return; };
			var testListener2 = Object.assign({}, testListener1);
			testListener2.name = 'testadd';
			testListener2.type = 'additional';
			global.Uwot.Listeners[testIsid] = {
				default: testListener1,
				testadd: testListener2
			};
			var finalListeners = [testListener1.name, testListener2.name]
			delete global.Uwot.Listeners[testNewIsid];
			var moveResult = isidListener.moveListeners(testIsid, testNewIsid);
			expect(Object.keys(global.Uwot.Listeners[testNewIsid])).to.deep.equal(finalListeners);
			delete global.Uwot.Listeners[testIsid];
			delete global.Uwot.Listeners[testNewIsid];
			ensureGlobalListenerStub.restore();
		
		});
		it('should disable all old isid listeners prior to removal', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			var testNewIsid = 'ladypig';
			var disabledListeners = [];
			var testListener1 = Object.assign({}, testDefaultListener);
			testListener1.disable = function() {
			
				disabledListeners.push(this.isid + '-' + this.name);
				return;
			
			};
			var testListener2 = Object.assign({}, testListener1);
			testListener2.name = 'testadd';
			testListener2.type = 'additional';
			global.Uwot.Listeners[testIsid] = {
				default: testListener1,
				testadd: testListener2
			};
			var finalDisabled = [testListener1.isid + '-' + testListener1.name, testListener2.isid + '-' + testListener2.name]
			delete global.Uwot.Listeners[testNewIsid];
			var moveResult = isidListener.moveListeners(testIsid, testNewIsid);
			expect(disabledListeners).to.deep.equal(finalDisabled);
			delete global.Uwot.Listeners[testIsid];
			delete global.Uwot.Listeners[testNewIsid];
			ensureGlobalListenerStub.restore();
		
		});
		it('should remove global.Uwot.Listeners[currentIsid] by calling removeGlobalListener', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			var removeGlobalListenerStub = sinon.stub(isidListener, 'removeGlobalListener').callsFake(function removeListener(isid) {
			
				delete global.Uwot.Listeners[isid];
				return true;
			
			});
			var testNewIsid = 'ladypig';
			var testListener1 = Object.assign({}, testDefaultListener);
			testListener1.disable = function() { return; };
			var testListener2 = Object.assign({}, testListener1);
			testListener2.name = 'testadd';
			testListener2.type = 'additional';
			global.Uwot.Listeners[testIsid] = {
				default: testListener1,
				testadd: testListener2
			};
			var finalListeners = [testListener1.name, testListener2.name]
			delete global.Uwot.Listeners[testNewIsid];
			isidListener.moveListeners(testIsid, testNewIsid);
			expect(global.Uwot.Listeners[testIsid]).to.be.undefined;
			expect(removeGlobalListenerStub.calledWith(testIsid)).to.be.true;
			delete global.Uwot.Listeners[testIsid];
			delete global.Uwot.Listeners[testNewIsid];
			ensureGlobalListenerStub.restore();
			removeGlobalListenerStub.restore();
		
		});
		it('should return a reference to global.Uwot.Listeners[newIsid]', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			var testNewIsid = 'ladypig';
			var testListener1 = Object.assign({}, testDefaultListener);
			testListener1.disable = function() { return; };
			var testListener2 = Object.assign({}, testListener1);
			testListener2.name = 'testadd';
			testListener2.type = 'additional';
			global.Uwot.Listeners[testIsid] = {
				default: testListener1,
				testadd: testListener2
			};
			delete global.Uwot.Listeners[testNewIsid];
			var moveResult = isidListener.moveListeners(testIsid, testNewIsid);
			expect(moveResult).to.deep.equal(global.Uwot.Listeners[testNewIsid]);
			delete global.Uwot.Listeners[testIsid];
			delete global.Uwot.Listeners[testNewIsid];
			ensureGlobalListenerStub.restore();
		
		});
	
	});
	describe('enableExclusiveState(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.enableExclusiveState).to.be.a('function');
		
		});
		it('should call ensureGlobalListener', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			isidListener.enableExclusiveState(testIsid);
			delete global.Uwot.Listeners[testIsid];
			expect(ensureGlobalListenerStub.calledWith(testIsid)).to.be.true;
			ensureGlobalListenerStub.restore();
		
		});
		it('should add the names of all currently enabled non-exclusive listeners to the array global.Uwot.Listeners[isid].disabledForExclusive', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			var testNewIsid = 'ladypig';
			var testListener1 = Object.assign({}, testDefaultListener);
			testListener1.status = 'enabled';
			testListener1.disable = function() { this.status = 'disabled'; return; };
			var testListener2 = Object.assign({}, testListener1);
			var testListener3 =  Object.assign({}, testListener1);
			var testListener4 =  Object.assign({}, testListener1);
			testListener2.name = 'testadd';
			testListener2.type = 'additional';
			testListener3.name = 'testexcl';
			testListener3.type = 'exclusive';
			testListener4.name = 'testadddis';
			testListener4.type = 'additional';
			testListener4.disable();
			global.Uwot.Listeners[testIsid] = {
				default: testListener1,
				testadd: testListener2,
				testexcl: testListener3,
				testadddis: testListener4
			};
			var finalDisabled = [testListener1.name, testListener2.name];
			var disableResult = isidListener.enableExclusiveState(testIsid);
			expect(global.Uwot.Listeners[testIsid].disabledForExclusive).to.deep.equal(finalDisabled);
			expect(testListener4.status).to.equal('disabled');
			delete global.Uwot.Listeners[testIsid];
			ensureGlobalListenerStub.restore();
		
		});
		it('should change the status of all disabledForExclusive Listeners to "disabled"', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			var testNewIsid = 'ladypig';
			var testListener1 = Object.assign({}, testDefaultListener);
			testListener1.status = 'enabled';
			testListener1.disable = function() { this.status = 'disabled'; return; };
			var testListener2 = Object.assign({}, testListener1);
			var testListener3 =  Object.assign({}, testListener1);
			var testListener4 =  Object.assign({}, testListener1);
			testListener2.name = 'testadd';
			testListener2.type = 'additional';
			testListener3.name = 'testexcl';
			testListener3.type = 'exclusive';
			testListener4.name = 'testadddis';
			testListener4.type = 'additional';
			testListener4.disable();
			global.Uwot.Listeners[testIsid] = {
				default: testListener1,
				testadd: testListener2,
				testexcl: testListener3,
				testadddis: testListener4
			};
			var disableResult = isidListener.enableExclusiveState(testIsid);
			expect(testListener1.status).to.equal('disabled');
			expect(testListener2.status).to.equal('disabled');
			delete global.Uwot.Listeners[testIsid];
			ensureGlobalListenerStub.restore();
		
		});
		it('should return the disabledForExclusive array', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			var testNewIsid = 'ladypig';
			var testListener1 = Object.assign({}, testDefaultListener);
			testListener1.status = 'enabled';
			testListener1.disable = function() { this.status = 'disabled'; return; };
			var testListener2 = Object.assign({}, testListener1);
			var testListener3 =  Object.assign({}, testListener1);
			var testListener4 =  Object.assign({}, testListener1);
			testListener2.name = 'testadd';
			testListener2.type = 'additional';
			testListener3.name = 'testexcl';
			testListener3.type = 'exclusive';
			testListener4.name = 'testadddis';
			testListener4.type = 'additional';
			testListener4.disable();
			global.Uwot.Listeners[testIsid] = {
				default: testListener1,
				testadd: testListener2,
				testexcl: testListener3,
				testadddis: testListener4
			};
			var finalDisabled = [testListener1.name, testListener2.name];
			var disableResult = isidListener.enableExclusiveState(testIsid);
			expect(disableResult).to.deep.equal(finalDisabled);
			expect(testListener4.status).to.equal('disabled');
			delete global.Uwot.Listeners[testIsid];
			ensureGlobalListenerStub.restore();
		
		});
		
	});
	describe('disableExclusiveState(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.disableExclusiveState).to.be.a('function');
		
		});
		it('should call ensureGlobalListener', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			isidListener.disableExclusiveState(testIsid);
			delete global.Uwot.Listeners[testIsid];
			expect(ensureGlobalListenerStub.calledWith(testIsid)).to.be.true;
			ensureGlobalListenerStub.restore();
		
		});
		it('should return an empty array if global.Uwot.Listeners[isid].disabledForExclusive is not a non-empty array', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			delete global.Uwot.Listeners[testIsid];
			var nonObjResult = isidListener.disableExclusiveState(testIsid);
			global.Uwot.Listeners[testIsid].disabledForExclusive = null;
			var nullResult = isidListener.disableExclusiveState(testIsid);
			global.Uwot.Listeners[testIsid].disabledForExclusive = [];
			var emptyArrayResult = isidListener.disableExclusiveState(testIsid);
			expect(nonObjResult).to.deep.equal([]);
			expect(nullResult).to.deep.equal([]);
			expect(emptyArrayResult).to.deep.equal([]);
			delete global.Uwot.Listeners[testIsid];
			ensureGlobalListenerStub.restore();
		
		});
		it('should enable all listeners in global.Uwot.Listeners[isid] matching names in the disabledForExclusive array if it is a non-empty array', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			var testNewIsid = 'ladypig';
			var testListener1 = Object.assign({}, testDefaultListener);
			testListener1.status = 'disabled';
			testListener1.disable = function() { this.status = 'disabled'; return; };
			testListener1.enable = function() { this.status = 'enabled'; return; };
			var testListener2 = Object.assign({}, testListener1);
			var testListener3 =  Object.assign({}, testListener1);
			var testListener4 =  Object.assign({}, testListener1);
			testListener2.name = 'testadd';
			testListener2.type = 'additional';
			testListener3.name = 'testexcl';
			testListener3.type = 'exclusive';
			testListener4.name = 'testadddis';
			testListener4.type = 'additional';
			testListener4.disable();
			global.Uwot.Listeners[testIsid] = {
				default: testListener1,
				testadd: testListener2,
				testexcl: testListener3,
				testadddis: testListener4
			};
			var disabledForExclusive = [testListener1.name, testListener2.name];
			global.Uwot.Listeners[testIsid].disabledForExclusive = disabledForExclusive;
			var enableResult = isidListener.disableExclusiveState(testIsid);
			expect(testListener1.status).to.equal('enabled');
			expect(testListener2.status).to.equal('enabled');
			expect(testListener3.status).to.equal('disabled');
			expect(testListener4.status).to.equal('disabled');
			delete global.Uwot.Listeners[testIsid];
			ensureGlobalListenerStub.restore();
		
		});
		it('should remove global.Uwot.Listeners[isid].disabledForExclusive if it is a non-empty array', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			var testNewIsid = 'ladypig';
			var testListener1 = Object.assign({}, testDefaultListener);
			testListener1.status = 'disabled';
			testListener1.disable = function() { this.status = 'disabled'; return; };
			testListener1.enable = function() { this.status = 'enabled'; return; };
			var testListener2 = Object.assign({}, testListener1);
			var testListener3 =  Object.assign({}, testListener1);
			var testListener4 =  Object.assign({}, testListener1);
			testListener2.name = 'testadd';
			testListener2.type = 'additional';
			testListener3.name = 'testexcl';
			testListener3.type = 'exclusive';
			testListener4.name = 'testadddis';
			testListener4.type = 'additional';
			testListener4.disable();
			global.Uwot.Listeners[testIsid] = {
				default: testListener1,
				testadd: testListener2,
				testexcl: testListener3,
				testadddis: testListener4
			};
			var disabledForExclusive = [testListener1.name, testListener2.name];
			global.Uwot.Listeners[testIsid].disabledForExclusive = disabledForExclusive;
			var enableResult = isidListener.disableExclusiveState(testIsid);
			expect(global.Uwot.Listeners[testIsid].disabledForExclusive).to.be.undefined;
			delete global.Uwot.Listeners[testIsid];
			ensureGlobalListenerStub.restore();
		
		});
		it('should return an array of all enabled Listener instance names if global.Uwot.Listeners[isid].disabledForExclusive is a non-empty array', function() {
		
			var ensureGlobalListenerStub = sinon.stub(isidListener, 'ensureGlobalListener').callsFake(function setGlobal(isid) {
			
				if ('object' !== typeof global.Uwot.Listeners[isid]) {
				
					global.Uwot.Listeners[isid] = {};
				
				}
				return global.Uwot.Listeners[isid];
			
			});
			var testNewIsid = 'ladypig';
			var testListener1 = Object.assign({}, testDefaultListener);
			testListener1.status = 'disabled';
			testListener1.disable = function() { this.status = 'disabled'; return; };
			testListener1.enable = function() { this.status = 'enabled'; return; };
			var testListener2 = Object.assign({}, testListener1);
			var testListener3 =  Object.assign({}, testListener1);
			var testListener4 =  Object.assign({}, testListener1);
			testListener2.name = 'testadd';
			testListener2.type = 'additional';
			testListener3.name = 'testexcl';
			testListener3.type = 'exclusive';
			testListener4.name = 'testadddis';
			testListener4.type = 'additional';
			testListener4.disable();
			global.Uwot.Listeners[testIsid] = {
				default: testListener1,
				testadd: testListener2,
				testexcl: testListener3,
				testadddis: testListener4
			};
			var disabledForExclusive = [testListener1.name, testListener2.name];
			global.Uwot.Listeners[testIsid].disabledForExclusive = disabledForExclusive;
			var enableResult = isidListener.disableExclusiveState(testIsid);
			expect(enableResult).to.deep.equal(disabledForExclusive);
			delete global.Uwot.Listeners[testIsid];
			ensureGlobalListenerStub.restore();
		
		});
		
	});
	describe('getServerListeners(isid)', function() {
	
		it('should be a function');
		it('should call this.ensureGlobalListener with value of isid arg');
		it('should return an Array');
		it('should return an empty Array if global.Uwot.Listeners[isid] does not have any own properties');
		it('should add an element to the result Array for each property in global.Uwot.Listeners[isid] that has a name property not equal to "disabledForExclusive"');
		it('should return an array of objects with properties "name", "options", and "status"');
	
	});

});
