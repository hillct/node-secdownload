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
        headers: {'Content-Type': 'text/plain; charset=utf-8'},
        body: 'OK'
      };
var nextMiddleware = function(req,res,next){
  return res.status(200).type('text/plain').end('OK');
};

function functionalTest(testDescription,testUrlData,testMiddlewareData,testNextMiddleware,testResponseObject,testDelay){
  it(testDescription, function() {
    // Generate test URL here...
    var testUrl = secDownload.buildUrl(testUrlData);
    // Optionally pause for specified timeout...
    var timeout=setTimeout(function(){
    return expect(require('express')().use(testUrlData.prefixstring,
	secDownload.middleware(testMiddlewareData), testNextMiddleware), 'to yield exchange satisfying', {
      request: {url: testUrl,headers: {Accept: 'text/plain'}},
      response: testResponseObject
    });
    clearTimeout(timeout);
    },testDelay || 1);
  });
}

describe("HTTP Response Tests:",function(){
  functionalTest("Invalid Token Response",
    Object.assign(urlData,{prefixstring: '/invalidToken', algorithm: 'sha256'}),
    Object.assign(middlewareData,{prefixstring: '/invalidToken', algorithm: 'md5'}),
    nextMiddleware,{statusCode: 403}
  );
});
