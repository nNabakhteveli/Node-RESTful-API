const http = require("http"); 
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;


const server = http.createServer((req, res) => {
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

      res.end("Hello world\n");

      console.log(`Request received with this payload: ${buffer} with method ${method}`);
   }); 
});


server.listen(3000, () => {
   console.log("The server is listening on http://localhost:3000");
});