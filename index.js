var request = require('request');
var PluginError = require('gulp-util').PluginError;
var through = require('through2');
var path = require('path');
var netrc = require('node-netrc');
var stream = require('stream');


function createError(message) {
  return new PluginError({
    plugin: 'gulp-heroku-deploy-slug',
    message: message
  });
}

function checkResponse(stream, response, error, msg) {
  if (error) {
    stream.emit('error', createError(msg + ': ' + error.message));
    return false;
  } else if (response.statusCode >= 400) {
    msg = msg + ': Received a status of ' + response.statusCode;
    stream.emit('error', createError(msg));
    return false;
  }
  return true;
}

function deploySlug(opts) {
  opts = opts || {};
  var slugInfo = opts.slug || {};

  var creds = netrc('api.heroku.com');
  if (!creds) {
    throw createError("Couldn't get Heroku credentials from .netrc");
  }
  creds = {username: creds.login, password: creds.password};

  if (!opts.app) {
    throw createError('Required option "app" cannot be found.');
  } else if (!slugInfo.process_types) {
    throw createError('Required slug config "process_types" cannot be found.');
  }

  return through.obj(function(file, enc, callback) {
    if (file.isNull() || file.isDirectory()) {
      return callback();
    }

    if (!/(\.tar\.gz|\.tgz)$/.test(file.path)) {
      this.emit('error', createError('File must be a .tar.gz archive!'));
      return callback();
    }

    // Create the slug.
    request.post({
      url: 'https://api.heroku.com/apps/' + opts.app + '/slugs',
      json: true,
      headers: {Accept: 'application/vnd.heroku+json; version=3'},
      body: slugInfo,
      auth: creds
    }, function(error, response, body) {
      if (!checkResponse(this, response, error, 'Failed to create slug')) {
        return callback();
      }

      var slugId = body.id;

      // Make sure we're dealing with a stream.
      var fileStream = file;
      if (file.isBuffer()) {
        fileStream = new stream.Transform();
        fileStream.push(file.contents);
      }

      // Upload the slug.
      fileStream.pipe(
        request.put({
          url: body.blob.url,
          headers: {'Content-Length': file.stat.size}
        }, function(error, response, body) {
          if (!checkResponse(this, response, error, 'Failed to upload slug')) {
            return callback();
          }

          if (opts.release === false) {
            return callback();
          }

          request.post({
            url: 'https://api.heroku.com/apps/' + opts.app + '/releases',
            json: true,
            headers: {Accept: 'application/vnd.heroku+json; version=3'},
            body: {slug: slugId},
            auth: creds
          }, function(error, response, body) {
            if (!checkResponse(this, response, error, 'Failed to release slug')) {
              return callback();
            }

            this.push(file);
            callback();
          }.bind(this));
        }.bind(this))
      );
    }.bind(this));
  });
}

module.exports = deploySlug;
