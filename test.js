var assert = require('assert');
var sinon = require('sinon');
var netrc = require('node-netrc');
var request = require('request');
var proxyquire = require('proxyquire');
var createFS = require('vinyl-fs-mock');


var deploySlug;
var fakeCreds = {login: 'a', password: 'b'};
var netrcMock = sinon.stub().returns(fakeCreds);
var requestMock = {
  post: sinon.stub().yields(null, {statusCode: 404})
};

describe('deploySlug()', function () {
  before(function() {
    deploySlug = proxyquire('./', {
      'node-netrc': netrcMock,
      request: requestMock
    });
  });

  describe('reading user config', function() {
    before(function() {
      netrcMock.returns(false);
    });

    after(function() {
      netrcMock.returns(fakeCreds);
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

  describe('slug creation', function() {
    it("errors if heroku doesn't create the slug", function(done) {
      var fs = createFS({'junk.tar.gz': ''});
      fs.src('junk.tar.gz')
        .pipe(deploySlug({app: 'whatever', slug: {process_types: 'x'}}))
        .on('error', function(err) {
          assert(err && /Failed to create slug/.test(err.message));
          done();
        });
    });
  });

});
