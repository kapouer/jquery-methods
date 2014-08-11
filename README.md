jquery-methods
==============

A little jquery request API focused on REST, express-style url building, and nodejs-style callbacks

```js
$.GET('/my/:param', {param: 'test', query: 1}, function(err, result) {
  // anything else than a successful statusCode between 200 and 400 excluded
  if (err) return console.error(err);
  // use result here
});

$.POST(url, {optional query params}, {body params}, function(err, result) {
  // if server replies 201 with a Location header, result contains the value of
  // that header
});
```

$.DELETE, $.HEAD, $.COPY are processed as GET requests,
$.PUT as a POST request.

All of these set "X-HTTP-Method-Override" HTTP header (expect weird corner
cases when dealing with cross-domain requests and preflighted requests).
https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Preflighted_requests

$.PUT or $.POST have these signatures:
(url, query, body, cb)
(url, body, cb)
(url, body)
(url, cb)
(url)

All other methods without body have:
(url, query, cb)
(url, query)
(url, cb)
(url)
