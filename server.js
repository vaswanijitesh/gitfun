var http = require("http");
var fs = require('fs');
var url = require("url");
var qs = require('querystring');

function start(route, handle) {
	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
		console.log("Request for " + pathname + " received.");

		var file_path = "";
		var mimes = {
			'css': 'text/css',
			'js': 'text/javascript',
			'htm': 'text/html',
			'html': 'text/html',
			'png': 'image/png',
			'jpg': 'image/jpg',
			'jpeg': 'image/jpeg',
			'gif': 'image/gif'
		};

		// parses the url request for a file and pulls the pathname
		var url_request = url.parse(request.url).pathname;
		// finds the placement of '.' to determine the extension                
		var tmp = url_request.lastIndexOf(".");
		// determines the extension by uing .substring that takes everything after '.'
		var extension = url_request.substring((tmp + 1));

		//set path of static pages
		if (extension === 'css' || extension === 'js' || extension === 'htm' 
								|| extension === 'html' || extension === 'png' 
								|| extension === 'jpg' || extension === 'jpeg' 
								|| extension === 'gif') {

			file_path = url_request.replace("/", "");

			//load needed pages and static files
			fs.readFile(file_path, function(error, data) {
				if (error) {
					response.writeHeader(500, {
						"Content-Type": "text/html"
					});
					response.write("<h1>FS READ FILE ERROR: Internal Server Error!</h1>");
				} else {
					response.writeHeader(200, {
						"Content-Type": mimes[extension]
					});
					response.write(data);
				}
				response.end();
			});
		} else {
			console.log("request.method is: " + request.method);
			if (request.method == 'POST') {
				var body = '';
				request.on('data', function(data) {
					body += data;
				});
				request.on('end', function() {
					var postData = qs.parse(body);
					route(pathname, postData, request, response);
				});
			} else if (request.method == 'GET') {
				var url_parts = url.parse(request.url, true);
				route(pathname, null, request, response);
			}


		}
	}

	http.createServer(onRequest).listen(8080);
	console.log("Server has started.");
}

exports.start = start;