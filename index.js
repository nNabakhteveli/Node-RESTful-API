const http = require("http"); 
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./lib/config");
const fs = require('fs');
const _data = require("./lib/data");
const handlers = require("./lib/handlers/handlers");
const helpers = require("./lib/helpers");


const httpServer = http.createServer((req, res) => {
   unifiedServer(req, res);
});


httpServer.listen(config.httpPort, () => {
   console.log(`The server is listening on port ${config.httpPort}`);
});

// Instantiate the https server

const httpsServerOptions = {
   'key': fs.readFileSync('./certs/key.pem'),
   'cert': fs.readFileSync('./certs/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
   unifiedServer(req, res);
})

// Start the https server

httpsServer.listen(config.httpsPort, () => {
   console.log(`The server is listening on port ${config.httpsPort}`);
});


const unifiedServer = (req, res) => {
   // Get the URL and parse it 
   const parsedUrl = url.parse(req.url, true);

   // Get the path
   const path = parsedUrl.pathname;
   const trimmedPath = path.replace(/^\/+|\/+$/g, '');

   const queryStringObj = parsedUrl.query;

   // Get the HTTP method

   const method = req.method.toLowerCase();
   const headers = req.headers;

   // Get the payload, if there is any
   const decoder = new StringDecoder('utf-8');
   let buffer = '';

   req.on("data", (data) => {
      buffer += decoder.write(data);
   });

   req.on('end', () => {
      buffer += decoder.end();

      // Choose the handler this request should go to.

      const chosenHandler = typeof router[trimmedPath] !== 'undefined' ? router[trimmedPath] : handlers.notFound;

      // Construct the data object to send to the handler
      const data = {
         'trimmedPath': trimmedPath,
         'queryStringObject': queryStringObj,
         'method': method,
         'headers': headers,
         'payload': helpers.parseJSONToObject(buffer)
      };

      // Route the request to the handler specified in the router
      chosenHandler(data, (statusCode, payload) => {
         // Use the status code called back by the handler, or default to 200
         statusCode = typeof statusCode == "number" ? statusCode : 200;

         // Use the payload called back by the handler, or default to an empty object
         payload = typeof payload == 'object' ? payload : {};
         const payloadString = JSON.stringify(payload);

         // Return the response

         res.setHeader("Content-Type", 'application/json');
         res.writeHead(statusCode);
         res.end(payloadString);
         
         console.log(`Returning this response: ${statusCode}`, payloadString);
      });
   });
}

const router = {
   'ping': handlers.ping,
   'users': handlers.users,
   'tokens': handlers.tokens,
   'checks': handlers.checks
}