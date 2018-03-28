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

describe('Basic Operations:', function() {
  functionalTest("Secret Only - Defaults: MD5 hash and 60 second token timeout",
	urlData,middlewareData,nextMiddleware,responseObject);
  functionalTest("Tokenization Algorythm: MD5",
    Object.assign(urlData,{algorithm: 'md5'}),
    Object.assign(middlewareData,{algorithm: 'sha1'}),
    nextMiddleware,responseObject
  );
  functionalTest("Tokenization Algorythm: hmac-sha1",
    Object.assign(urlData,{algorithm: 'sha1'}),
    Object.assign(middlewareData,{algorithm: 'sha1'}),
    nextMiddleware,responseObject
  );
  functionalTest("Tokenization Algorythm: hmac-sha256",
    Object.assign(urlData,{algorithm: 'sha256'}),
    Object.assign(middlewareData,{algorithm: 'sha256'}),
    nextMiddleware,responseObject
  );
});

/*
describe("HTTP Response Tests:",function(){
  functionalTest("Invalid Token Response",
    Object.assign(urlData,{prefixstring: '/invalidToken', algorithm: 'sha256'}),
    Object.assign(middlewareData,{prefixstring: '/invalidToken', algorithm: 'md5'}),
    nextMiddleware,{statusCode: 403}
  );
  functionalTest("Expired Token Response",
    Object.assign(urlData,{prefixstring: '/timeoutTest',timeout: 5}),
    Object.assign(middlewareData,{prefixstring: '/timeoutTest'}),
    nextMiddleware,{statusCode: 410},7000
  );
});
*/
