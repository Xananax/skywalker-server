var Tree = require('skywalker-x');
var path = require('path');
var browserSync = require("browser-sync");

function extractContent(file,tree){
	var props = file._;
	var t =(
		(file._.bin && file._.bin({files:tree._tree})) ||
		file._.rendered ||
		file._.contents
	)
	;
	return t;
}

function findEquivalent(filename,parent){
	if(!parent){return false;}
	var ext = path.extname(filename).replace(/^\./,'');
	var name = path.basename(filename,'.'+ext);
	var equiv;
	if(ext=='html' || ext=='htm'){equiv = /(jade|md)/;}
	else if(ext=='css'){equiv = /(styl|stylus|less|sass|scss)/}
	else{return false;}
	console.log(name,ext);
	for(var n in parent){
		if(parent[n]._.name == name && parent[n]._.extension.match(equiv)){
			return parent[n];
		}
	}
	return false;
}

Tree.prototype.server = function(watch,callback){
	if(typeof watch == 'function'){
		callback = watch;
		watch = false;
	}
	var that = this;
	var bs;

	function serve(req,res,next){
		var url = that.filename+req.url;
		var file = that.get(url);
		var contents;
		if(file){
			if(file._.isDirectory){
				var n,t;
				for(n in file){
					if(that._indexFiles && n.match(that._indexFiles) && (t = extractContent(file[n],that))){
						return res.status(200).send(t);
					}
				}
				if(that._serveDirectories){
					var isRoot = (!req.url||req.url=='/'||req.url=='');
					t = serveDirectory(file,isRoot);
					return res.status(200).send(t);
				}
				return next();
			}
			contents = extractContent(file,that);
			if(contents){
				return res.status(200).send(contents);
			}
		}else{
			file = findEquivalent(url,that.get(path.dirname(url)));
			if(file){
			contents = extractContent(file,that);
				if(contents){
					return res.status(200).send(contents);
				}
			}
		}
		res.status(500).send({url:req.url,filepath:url,file:file&&file._||false});
	}

	function ready(err,files){
		if(err){return callback(err);}
		browserSync({
			online:false
		,	logSnippet: false
		},function(err, bsInstance){
			if(err){return callback(err);}
			that.on('changed',function(file){
				browserSync.reload(file._.path);
			})
			callback(null,serve);
		});
	}

	if(watch){
		this.watch('watch',ready);
	}else{
		this.start(ready);
	}
	return this;
}

var defaults = {
	serveDirectories:true
,	indexes:/^index\.(html|htm|jade|ejs|md)/
}

function serveDirectory(dir,isRoot){
	var c,root,i,l;
	root = dir._.filename;
	var str='<html><head><title>'+root+'</title></head><body><h1>'+root+'</h1><ul>';
	var children = dir._.children;
	for(var i = 0, l = children.length;i<l;i++){
		c = children[i]._;
		str+='<li><a href="'+(isRoot?'':root)+'/'+c.filename+'">'+c.filename+'</a></li>'
	}
	str+='</ul></body></html>';
	return str;
}

function createServer(root,opts){

	root = path.normalize(path.resolve(root || '.'));

	var ready = function(err,files){
		if(err){return cb(err);}
		cb(null,t);
	}

	opts = opts || {};

	for(var n in defaults){
		if(!opts[n]){opts[n] = defaults[n];}
	}


	var t = Tree(root).ignoreDotFiles();

	if(opts.indexes){
		t._indexFiles = opts.indexes;
	}

	if(opts.serveDirectories){
		t._serveDirectories = opts.serveDirectories;
	}

	t.filter(/node_modules/,function(next,done){done(null,false);})
	t.filter_contents();
	if(opts && opts.plugins){
		if(opts.plugins=='all'){
		   t.filter_browserify()
			.filter_checksum()
			.filter_coffeescript()
			.filter_images()
			.filter_jade()
			.filter_json()
			.filter_less()
			.filter_markdown()
			.filter_sass()
			.filter_size()
			.filter_stylus()
			.filter_uniqueId()
			.filter_websafe()
			.filter_xml()
			.filter_yaml()
			;
		}
		else{		
			while(plugins.length){
				var p = plugins.shift();
				if(typeof p == 'function'){
					t.plugin(p);
				}
				else if(typeof p == 'string'){
					t['filter_'+p]()
				}else if(p.name){
					t.plugin(p.name);
				}
			}
		}
	}


	if(opts && opts.bunyan){
		t.on('created',function(file){opts.bunyan.info('-- created: file `%s`',file._.filename);});
		t.on('removed',function(file){opts.bunyan.info('-- removed: file `%s`',file._.filename);});
		t.on('changed',function(file){opts.bunyan.info('-- changed: file `%s`',file._.filename);});
		t.on('renamed',function(file){opts.bunyan.info('-- renamed: file `%s`',file._.filename);});
	}

	if(opts && opts.verbose){
		t.on('created',function(file){console.log('-- created: file',file._.filename);});
		t.on('removed',function(file){console.log('-- removed: file',file._.filename);});
		t.on('changed',function(file){console.log('-- changed: file',file._.filename);});
		t.on('renamed',function(file){console.log('-- renamed: file',file._.filename);});
	}

	return t;

}

module.exports = createServer;