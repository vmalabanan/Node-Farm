const fs = require('fs'); // fs = file system. File I/O
const http = require('http'); // gives us networking capabilities, which we'll use to build an http server
const url = require('url'); // to analyze urls, which we'll use for routing

///////////////////////////////////////////
///// SERVER
//////////////////////////////////////////
const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');

  return output;
};

// Read the contents of our html files and save to variables
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

// Read the contents of our JSON file and save to variable
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data); // parse data into a JavaScript object

// Create server and pass in a callback function that will be run every time we get a new request to the server
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true); // will create two variables using the values with the exact same names in req.url

  // Routing
  // Overview
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' }); // tell the browser we're sending back html

    const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');

    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);
  }

  // Product
  else if (pathname === '/product') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  }

  // API
  else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' }); // tell the browser we're sending back a JSON file
    res.end(data); // Send data (JSON file) as a response
  }

  // Not found
  else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world',
    });

    res.end('<h1>Page not found!</h1>');
  }
});

// Start server
server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
