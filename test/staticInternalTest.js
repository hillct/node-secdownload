"use strict";
var expect = require('unexpected').clone()
	.installPlugin(require('unexpected-express'));
var secDownload = require('../lib/secdownload');

var urlData={
  secret: 'abc123',
  prefixstring: '/testPrefix',
  relpath: '/file/name/here.txt'
};

var middlewareData={
  secret: urlData.secret
};

var responseObject = {
        statusCode: 200,
        headers: {'Content-Type': 'text/plain; charset=UTF-8'},
        body: 'OK'
      };
var nextMiddleware = function(req,res,next){
  return res.status(200).type('text/plain').end('OK');
};

describe("Final File Handling:",function(){
  it("Using Express.Response.sendFile() (internal)", function() {
    // Generate test URL here...
    var testUrl = secDownload.buildUrl(Object.assign(urlData,{prefixstring: '/staticTestData'}));
    return expect(require('express')().use('/staticTestData',
	secDownload.middleware( Object.assign(middlewareData,{staticdir: __dirname+'/staticTestData'})
        ) ), 'to yield exchange satisfying', {
      request: {url: testUrl,headers: {Accept: 'text/plain'}},
      response: Object.assign(responseObject,{ body: "Static Text\n" })
    });
  });
});
