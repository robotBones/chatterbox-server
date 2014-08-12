// parsing get requests
var url = require('url');
var cache = [];
// mongo db
// var uri = "sprintDB";
// var mongojs = require("mongojs");
// var db = mongojs.connect(uri, ["chatter"]);

/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */

var parseRequest = function(request, response, callback) {
  var data = '';
  request.on('data', function(chunk) {
    data += chunk;
  });
  request.on('end', function() {
    callback(data);
  });
}

var handleRequest = function(request, response) {
  getReq = url.parse(request.url).query;
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */

  // parsing requests
  parseRequest(request, response, function(data){
    console.log("Serving request type " + request.method + " for url " + request.url + " and some data: " + data);
    // condition for accepting POST requests
    if(request.method === "POST"){
      if(request.url === "/log"){
        /* .writeHead() tells our server what HTTP status code to send back */
        responseWith(request,response, 200, data);
      } else if(request.url === "/classes/messages"){
        responseWith(request,response, 201,data);
      } else if((/^\/classes\/room/).test(request.url)){
        responseWith(request,response, 201, data);
      }
    } else if (request.method === 'GET' && (/^\/classes\//).test(request.url)){
      if(request.url === "/classes/messages"){
        responseWith(request,response, 200, data);
      } else if((/^\/classes\/room/).test(request.url)){
        responseWith(request,response, 200, data);
      }
    } else {
      // 404 case
      console.log("catch all case");
      responseWith(request,response);
      response.end();
    }
  });
  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

var responseWith = function(request, response, statusCode, data){
  statusCode = statusCode || 404;
  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "application/json";

  // prepping expected JSOn payload
  var payload = {};
  payload.results = [];
  // payload.results.push(defaultMessage);
  response.writeHead(statusCode, headers);

  // mongdb access
  if(request.method === 'POST'){
    cache.push(JSON.parse(data));
    response.end(data);
    // db.chatter.save(JSON.parse(data), function(err,saved){
    //   if( err || !saved ) console.log("chatter not saved");
    // });
  }
  if(request.method === 'GET'){
    payload.results = cache;
    response.end(JSON.stringify(payload));
    // var parsed = data;

    // db.chatter.find(JSON.parse(data).username, function(err,saved){
    //   if( err || !saved ) console.log("chatter not found");
    // });
  }
}

var handler = handleRequest;
module.exports.handleRequest = handleRequest;
module.exports.handler = handler;