gulp-heroku-deploy-slug
=======================

gulp-heroku-deploy-slug is a [gulp](https://github.com/wearefractal/gulp) plugin
for deploying [slug archives][1] to Heroku.


## Usage

Just pipe your slug in!

```javascript
var deploySlug = require('gulp-heroku-deploy-slug');

gulp.src('./path/to/slug.tar.gz') // Or get it some other way
  .pipe(deploySlug({
    app: 'myherokuapp',
    slug: {
      process_types: {
        web: 'node-v0.10.20-linux-x64/bin/node web.js'
      }
    }
  }));
```

Like with the Heroku command line tools, your credentials are read from your
`~/.netrc`.


### Options

| Name | Description                                                                                                                                    |
|------|------------------------------------------------------------------------------------------------------------------------------------------------|
| app  | The name of your Heroku app                                                                                                                    |
| slug | A hash of parameters used to create the slug. The only required parameter is `process_types`. See [Heroku's Platform API][2] for more details. |


[1]: https://devcenter.heroku.com/articles/platform-api-deploying-slugs
[2]: https://devcenter.heroku.com/articles/platform-api-reference#slug-create
