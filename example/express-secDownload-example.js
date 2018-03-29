const morgan=require('morgan');
const serve=require('serve-static');

const express = require('express');
const app = express();
var secDownload = require('../lib/secdownload.js');

var settings={
  secret: 'abc123',	// Do not make this public
  timeout: 30,  // URL self-destruct tim in seconds
  algorithm: 'md5',	// Supports 'md5', 'sha1', or 'sha256'
};

app.use('/download', secDownload.middleware(settings), function(req,res,next){
  res.status(200).send('Token validated, and stripped yielding the URL: '+
	req.protocol+'://'+req.header('host')+req.originalUrl);
});
app.use('/download-external', secDownload.middleware(settings),serve(__dirname+'/public'));
settings.staticdir=__dirname+'/public';	// Add a static content path to use sendFile() via secDownload
app.use('/download-internal', secDownload.middleware(settings));
app.use('/request', function (req, res) {
  var output="Each of these URLs with embedded secDownload tokens, will expire in "+settings.timeout+" seconds:";
  ['/download','/download-internal','/download-external'].forEach(function(prefix){
    var newUrl = secDownload.buildUrl({
      secret: settings.secret,
      timeout: settings.timeout,
      algorythm: settings.algorythm,
      prefixstring: req.protocol+'://'+(req.header('host')||req.hostname)+prefix,
      relpath: req.path
    });
    output+="<br><a href='"+newUrl+"'>"+newUrl+"</a>";
  });
  res.send(output);
});
app.use(morgan('combined'));	// Logging middleware
app.get('/',function(req,res,next){
  res.send("Try calling this example with a test URL <a href='/request/file.txt'>like this one</a>.").end();
});

module.exports.secDownload = secDownload;
module.exports.server = app.listen(8080,'dev.weaccompany.com', function () {
  console.log('Example app listening on port 8080!')
});
