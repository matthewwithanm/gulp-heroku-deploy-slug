var assert = require('assert');
var gutil = require('gulp-util');
var deploySlug;
var sinon = require('sinon');
var netrc = require('node-netrc');
var proxyquire = require('proxyquire');

describe('deploySlug()', function () {
  it('errors if netrc is missing creds', function() {
    deploySlug = proxyquire('./', {
      'node-netrc': sinon.stub().returns(false)
    });
    assert.throws(
      function() {
        deploySlug();
      },
      "Couldn't get Heroku credentials"
    );
  });

  deploySlug = require('./');

  it('errors if app is missing', function() {
    assert.throws(
      function() {
        deploySlug();
      },
      'Required option "app" cannot be found'
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
