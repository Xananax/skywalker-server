var skywalkerServer = require('../lib/server')
var app = require('express')();

var tree = skywalkerServer('./example',{verbose:true})
.filter_markdown()
.filter_jade()
.filter_stylus()
.filter_browserify()
.server(true,function(err,serve){
	app.use(serve);
	app.listen(1337);
	console.log('skywalker server is listening on port localhost:3000')
});