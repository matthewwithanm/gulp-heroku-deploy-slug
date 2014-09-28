var assert = require('assert');
var sinon = require('sinon');
var netrc = require('node-netrc');
var proxyquire = require('proxyquire');


var deploySlug;
var netrcMock = sinon.stub();

describe('deploySlug()', function () {
  before(function() {
    deploySlug = proxyquire('./', {
      'node-netrc': netrcMock
    });
  });

  describe('reading user config', function() {
    before(function() {
      netrcMock.returns(false);
    });

    it('errors if netrc is missing creds', function() {
      assert.throws(
        function() {
          deploySlug({app: 'whatever', slug: {process_types: 'x'}});
        },
        /Couldn't get Heroku credentials/
      );
    });
  });

  describe('missing options', function() {
    before(function() {
      netrcMock.returns({login: 'a', password: 'b'});
    });

    it('errors if app is missing', function() {
      assert.throws(
        function() {
          deploySlug();
        },
        /Required option "app" cannot be found/
      );
    });

    it('errors if process_types is missing', function() {
      assert.throws(
        function() {
          deploySlug({app: 'whatever'});
        },
        'Required slug config "process_types" cannot be found.'
      );
    });
  });

});
