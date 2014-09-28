var assert = require('assert');
var gutil = require('gulp-util');
var deploySlug;
var sinon = require('sinon');
var netrc = require('node-netrc');
var proxyquire = require('proxyquire');

describe('deploySlug()', function () {
  before(function () {
    deploySlug = proxyquire('./', {
      'node-netrc': sinon.stub().returns(false)
    });
  });

  it('error if netrc is missing creds', function() {
    assert.throws(
      function() {
        deploySlug();
      },
      "Couldn't get Heroku credentials"
    );
  });
});
