# Skywalker-server
==================

Builds on [skywalker](https://github.com/Xananax/skywalker) and provides a static express/connect middleware that automatically compiles:

- stylus, less, sass
- markdown
- json, xml, yaml
- coffeescript
- plain text files
- browserifies js files that have extension '.bs.js'

Since Skywalker keeps all files in memory, and does a whole damn lot of processing, it is not advised to use Skywalker-server in production; It is intended as a rapid prototyping tool.

----

## Usage

```js
    var skywalkerServer = require('skywalker-server')
    var app = require('express')();

    skywalkerServer('./',{watch:true},function(err,tree){
        app.use(tree.server);
        app.listen(3000);
    });

```