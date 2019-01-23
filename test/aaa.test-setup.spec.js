const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');

before(function () {

	chai.use(sinonChai);

});

afterEach(function() {

	sinon.restore();

});



