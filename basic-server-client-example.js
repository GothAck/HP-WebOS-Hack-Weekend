#!/usr/bin/env node

var http = require ('http');

var server = http.createServer (requestListener);

server.listen (8080, 'localhost');

function requestListener (request, result)
{
	result.writeHead (200, 'OK', {'Content-Type': 'text/html'});
	// Do get to API
	http.get ({
		host: 'localhost',
		port: 80,
		path: request.path
	})
		.on('response', function (response) {
			// Data buffer
			var data = '';
			response
				.on('data', function (chunk) {
					// Add chunk to data buffer
					data += chunk;
				})
				.on('end', function () {
					// Do data processing here
					result.write (data);
					result.end ();
				});
		});
}
