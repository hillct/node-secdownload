var crypto;
try {
  crypto = require('crypto');
} catch (err) {
  throw "secDownload requires the 'crypto' module";
}
var path=require('path');

module.exports={
  middleware: function(settings){
    var options = Object.assign({ timeout: 60, algorithm: 'md5' },settings);
    return(function(req,res,next){
      if(!options.hasOwnProperty('secret')){ throw "A 'secret' key is required for secDownload"; }
      var hexTimestamp = (Date.now() / 1000 | 0).toString(16);
      var hash = (options.algorithm.match("sha"))?crypto.createHmac(options.algorithm,options.secret):crypto.createHash('md5');
      var segments=req.path.split('/');	// foo / token / hexTimestamp / rel_path
      if(segments[0]==''){ segments.shift(); }	// In case the baseUrl ends in a '/'
      var decTimestamp = segments[1].split('').reduce( (result, ch) =>
	result * 16 + '0123456789abcdefgh'.indexOf(ch), 0);
      var token=hash.update(options.secret,segments.slice(2).join('/'),segments[1]).digest('hex');
      if(  (Date.now() / 1000 | 0) - decTimestamp > options.timeout ){	// status 410 - GONE
        res.statusCode = 410; res.setHeader('Content-Length', '0'); res.end();
      }else if(token !== segments[0]){	// status 404 - Not Found, Maybe 403 forbidden...
        res.statusCode = 403; res.setHeader('Content-Length', '0'); res.end();
      } else{	// Maybe update the URL to be parsed by serve-static / express.static
        req.url = req.url.replace('/'+token+'/'+segments[1],'');
        req.path = req.path.replace('/'+token+'/'+segments[1],'');
        req.originalUrl = req.originalUrl.replace('/'+token+'/'+segments[1],'');
        if(options.staticdir){
//          console.log("We're using res.sendFile() from within secDownload()\nTarget File is: "
//		+path.join(options.staticdir,req.path) );
          res.sendFile(req.path,{root: options.staticdir},function(err){
            if(err) {
//	      console.log(err);
	      res.status(err.statusCode).end();
            }
          });
        } else if(typeof(next) != 'function'){
          throw "Either add a final handler after secDownload(), "
		+"or static delivery path secDownload({ staticdir: 'static/content/root'})";
        } else { next(); }	// We have a next() middleware... so call it...
      }
    });
  },
  buildUrl: function(fields){	// prefix, secret, relpath
    if(!fields.secret) throw "Encrypted URL 'secret' is required";
    var hash = (fields.algorithm && fields.algorithm.match("sha"))?crypto.createHmac(fields.algorithm,fields.secret):crypto.createHash('md5');
    var hexTimestamp = (Date.now() / 1000 | 0).toString(16);
    var token=hash.update(fields.secret,fields.relpath,hexTimestamp).digest('hex');
    return(fields.prefixstring+"/"+token+"/"+hexTimestamp+fields.relpath);  
  }
};
